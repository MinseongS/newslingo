
export interface NewsItem {
    id: number;
    news_id: string;
    news_url: string;
    thum_url: string | null;
    broadcast_date: string;
    news_english: News[];
    category: string;
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

export interface Comment {
    id: number; // 댓글 고유 ID
    news_id: string; // 연결된 뉴스 ID
    content: string; // 댓글 내용
    createdAt: string; // 작성 시간
    userId: string; // 작성자 ID
    userName?: string; // 작성자 이름
    userImage?: string; // 작성자 프로필 이미지
}