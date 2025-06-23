from typing import TypedDict
from pydantic.v1 import BaseModel, Field, constr

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

from celery_app.pipeline.base import BaseClassifier
from celery_app.configs.config import get_config


# 1. Pydantic으로 출력 포맷 및 카테고리 정의
class NewsCategory(BaseModel):
    category: constr(
        regex="^(Finance|Technology|Social|Sports|Entertainment|Politics|Weather|ETC)$"
    ) = Field(  # type: ignore
        description="The single category of the news article."
    )


# 2. LangGraph 상태 정의
class ClassificationState(TypedDict):
    content: str
    category: str
    error_message: str


class NewsClassifier(BaseClassifier):
    PREDEFINED_CATEGORIES = [
        "Finance",
        "Technology",
        "Social",
        "Sports",
        "Entertainment",
        "Politics",
        "Weather",
    ]

    def __init__(self, method="default"):
        self.method = method
        self.config = get_config()
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0,
            google_api_key=self.config["GEMINI_KEY"],
        )

        # LangChain 체인 초기화
        parser = PydanticOutputParser(pydantic_object=NewsCategory)
        prompt = ChatPromptTemplate.from_template(
            "Classify the article into one of the predefined categories. "
            "Respond with a JSON object that follows this format: {format_instructions}\n\nArticle: {content}",
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        self.classification_chain = prompt | llm | parser

        # LangGraph 워크플로우 빌드
        self.workflow = self._build_workflow()

    def _build_workflow(self):
        workflow = StateGraph(ClassificationState)
        workflow.add_node("classifier", self._try_classification)
        workflow.set_entry_point("classifier")
        workflow.add_edge("classifier", END)
        return workflow.compile()

    def classify(self, item):
        content = item["content"]
        if self.method == "default":
            # LangGraph 워크플로우 실행
            final_state = self.workflow.invoke({"content": content})
            item["category"] = final_state.get("category", "ETC")
        else:
            # 다른 분류 방식이 추가될 경우를 위한 공간
            item["category"] = "ETC"
        return item

    def _try_classification(self, state: ClassificationState):
        content = state["content"]
        try:
            # LangChain 체인으로 분류 실행
            result = self.classification_chain.invoke({"content": content})
            state["category"] = result.category
        except Exception as e:
            state["error_message"] = str(e)
            state["category"] = "ETC"  # 실패 시 ETC로 설정
        return state

    def default_classify(self, translated):
        content = translated["content"]
        try:
            predefined_categories_text = ", ".join(self.PREDEFINED_CATEGORIES)
            prompt = (
                f"Classify the following article into one of the predefined categories: "
                f"{predefined_categories_text}. "
                f"Provide exactly one category, and nothing else.\n\n"
                f"Article: {content}"
            )
            response = self.llm_model.generate_content(contents=prompt)
            raw_category = response.text.strip()
            if raw_category in self.PREDEFINED_CATEGORIES:
                news_category = raw_category
            else:
                news_category = "ETC"
        except Exception:
            news_category = None
        translated["category"] = news_category
        return translated

    def llm_classify(self, translated):
        # LLM 기반 분류 방식이 추가로 필요할 때 구현
        return self.default_classify(translated)
