export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface SearchResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}
