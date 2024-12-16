module.exports = {
    siteUrl: "https://newslingo.site",
    generateRobotsTxt: true,
    async additionalPaths(config) {
        try {
            // /api/news_id를 호출하여 news_id 데이터 가져오기
            const response = await fetch("https://newslingo.site/api/news_id");
            const ids = await response.json();

            // news_id 배열을 사이트맵 형식으로 변환
            return ids.map((id) => ({
                loc: `/news/${id}`, // 동적 경로 생성
                changefreq: "daily", // 변경 빈도 (옵션)
                priority: 0.8, // 우선순위 (옵션)
            }));
        } catch (error) {
            console.error("Failed to fetch news IDs for sitemap:", error);
            return [];
        }
    },
};