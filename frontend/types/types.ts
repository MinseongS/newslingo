
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

export interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    userId: string;
    userImage?: string;
    userName?: string;
    imageUrl?: string;
    board: {
        name: string;
        code: string;
    };
    author: {
        id: string;
        profilePicture: string;
        name: string;
    }
}