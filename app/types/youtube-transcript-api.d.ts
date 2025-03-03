declare module 'youtube-transcript-api' {
  export interface TranscriptResponse {
    text: string;
    start: number;
    duration: number;
  }

  export class YouTubeTranscriptApi {
    static getTranscript(
      videoId: string,
      options?: {
        languages?: string[];
      }
    ): Promise<TranscriptResponse[]>;
  }

  export default YouTubeTranscriptApi;
}
