
export interface NewsItem {
    id: number;
    news_id: string;
    news_url: string;
    thum_url: string | null;
    broadcast_date: string;
    news_english: News[];
}

export interface NewsItemDetail {
    id: number;
    news_id: string;
    news_url: string;
    thum_url: string | null;
    broadcast_date: string;
    news_english: News[];
    news_korean: News[];
}

export interface Pagination {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface News {
    title: string;
    content: string;
};