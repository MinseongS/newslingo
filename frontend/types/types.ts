export interface NewsItem {
    id: number;
    news_id: string;
    news_url: string;
    thum_url: string | null;
    broadcast_date: string;
    news_english: News[];
    category: string;
    created_date: string;
}

export interface NewsItemDetail {
    id: number;
    news_id: string;
    news_url: string;
    thum_url: string | null;
    broadcast_date: string;
    created_date: string;
    news_english: News[];
    news_korean: News[];
    tts: TTS[];
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

export interface TTS {
    id: number;
    news_id: string;
    full_text_audio_path: string;
    sentences_audio_path: string;
}