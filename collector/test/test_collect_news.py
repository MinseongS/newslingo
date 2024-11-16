from celery_app.services.collect_news import get_arirang_news
from celery_app.services.translate import googletrans_translate

def test_get_arirang_news():
    news = get_arirang_news()
    assert isinstance(news, dict)
    assert "items" in news

def test_translate():
    text = "A former counselor at the North Korean Embassy to Cuba, Lee Il-kyu, who defected to the South last year has revealed confidential diplomatic cables that show Pyongyang's relentless drive to counter global pressure on its human rights record. \r\nOur North Korean affairs correspondent Kim Jung-sil reports.\n \nCounselor Lee Il-kyu described the revelation as a \"North Korean version of WikiLeaks.\"\r\nThe 12 diplomatic cables, dating from 2016 to 2023, carry direct orders from Kim Jong-un to overseas workers, aimed at countering global criticism of Pyongyang's human rights record.\r\n\r\n\"I decided to release these documents because I want the world to see that the horrific human rights abuses in North Korea lead directly back to Kim Jong-un. He's not ignoring the international criticism; he's fully aware of it and actively directing strategies to deflect and suppress it.\"\r\n\r\nTake a look at one example.\r\n\r\nA February 2020 diplomatic cable states, \"The enemy has malicious political intent to overthrow our country with barbaric sanctions,\" underscoring how the regime sees international human rights pressure not as a genuine concern but as part of a broader geopolitical struggle.\r\n \r\nWe asked Counselor Lee why Kim Jong-un is so concerned about international criticism on human rights, \r\ngiven that information is so restricted in North Korea that residents are unlikely to ever hear it.\r\n\r\n\"North Korea works tirelessly to block external information, but many channels still leak foreign news back into the country. When overseas workers return, stories of international condemnation of human rights inevitably spread among citizens, creating pressure on Kim Jong-un.\"\r\n\r\n \r\nProfessor Lim Eul-chul warns Counselor Lee's disclosures, while purposeful, may have unintended effects.\r\n\r\n\"While this can raise human rights awareness, it also leads to tighter control over the elite. As long as Kim Jong-un remains in power and feels insecure, major improvements are unlikely.\"\r\n\r\nUnification Minister Kim Yung-ho said the government plans to intensify multifaceted efforts to bring real improvements to North Korea's human rights situation.\r\nKim Jung-sil, Arirang News."
    source_lang = "ko"
    target_lang = "en"
    translated_text = googletrans_translate(text, source_lang, target_lang)
    print(translated_text)
    assert isinstance(translated_text, str)
    assert False