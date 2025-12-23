export type NewsItem = {
    id: number
    created_at: string
    title: string
    content?: string
    image_url?: string
    date: string
}

export type VideoItem = {
    id: number
    created_at: string
    title: string
    video_url: string
    thumbnail_url?: string
    date: string
}

export type ProjectItem = {
    id: number
    created_at: string
    title: string
    description: string
    icon: string
    color: string
}
