from typing import TypedDict, List
from pydantic.v1 import BaseModel, Field

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

from celery_app.pipeline.base import BaseTranslator
from celery_app.configs.config import get_config


# 1. LangChain & Pydantic: 출력 포맷 정의
class TranslatedPair(BaseModel):
    english: str = Field(description="The original English sentence")
    korean: str = Field(description="The translated Korean sentence")


class TranslationOutput(BaseModel):
    pairs: List[TranslatedPair]


# 2. LangGraph: 상태 정의
class TranslationState(TypedDict):
    original_text: str
    translated_pairs: List[dict]
    final_translation: dict
    error_message: str


class NewsTranslator(BaseTranslator):
    def __init__(self):
        self.config = get_config()
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0,
            google_api_key=self.config["GEMINI_KEY"],
        )

        # 본문 번역을 위한 LangChain 체인 (JSON 출력)
        parser = JsonOutputParser(pydantic_object=TranslationOutput)
        content_prompt = ChatPromptTemplate.from_template(
            "This is a News Article. Translate the following sentences into Korean. "
            "Ensure that each English sentence is immediately followed by its Korean translation with a new line. "
            "Keep the order exactly as given and English first then Korean. "
            "Respond with a JSON object that follows this format: {format_instructions}\n\n"
            "Original Sentences:\n{text}",
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        self.content_translation_chain = content_prompt | llm | parser

        # 제목 번역을 위한 간단한 LangChain 체인 (문자열 출력)
        title_prompt = ChatPromptTemplate.from_template(
            "Translate the following title to Korean: {title}"
        )
        self.title_translation_chain = title_prompt | llm | StrOutputParser()

        # LangGraph 워크플로우 컴파일
        self.workflow = self._build_workflow()

    def _build_workflow(self):
        workflow = StateGraph(TranslationState)

        workflow.add_node("llm_translator", self._try_llm_translation)
        workflow.add_node("finalizer", self._finalize_translation)

        workflow.set_entry_point("llm_translator")
        workflow.add_conditional_edges(
            "llm_translator",
            self._validate_translation,
            {
                "translation_successful": "finalizer",
                "translation_failed": END,  # 실패 시 바로 종료
            },
        )
        workflow.add_edge("finalizer", END)
        return workflow.compile()

    def translate(self, item):
        # LangGraph 워크플로우로 본문 번역 실행
        final_state = self.workflow.invoke({"original_text": item["content"]})
        item["translated_content"] = final_state.get(
            "final_translation", {"english": item["content"], "korean": ""}
        )
        item["sentences"] = final_state.get("translated_pairs", [])

        # LangChain으로 제목 번역 실행
        item["translated_title"] = self.title_translation_chain.invoke(
            {"title": item["title"]}
        )

        item["news_id"] = item["news_url"].split("id=")[-1]
        return item

    def _try_llm_translation(self, state: TranslationState):
        text = state["original_text"]
        try:
            result = self.content_translation_chain.invoke({"text": text})
            state["translated_pairs"] = result.get("pairs", [])
            state["final_translation"] = {
                "english": text,
                "korean": "",
            }  # 실패 대비 초기화
        except Exception as e:
            state["error_message"] = str(e)
            state["translated_pairs"] = []
            state["final_translation"] = {"english": text, "korean": ""}
        return state

    def _validate_translation(self, state: TranslationState):
        return (
            "translation_successful"
            if state.get("translated_pairs")
            else "translation_failed"
        )

    def _finalize_translation(self, state: TranslationState):
        english_text = "\n".join([p["english"] for p in state["translated_pairs"]])
        korean_text = "\n".join([p["korean"] for p in state["translated_pairs"]])
        state["final_translation"] = {"english": english_text, "korean": korean_text}
        return state
