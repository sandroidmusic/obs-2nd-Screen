export interface ChatMessage {
  message: string;
  username: string;
  firstletter: string;
  image: string | null;
  time: string;
}

export interface Action {
  type: string;
  action: string;
  radiogroup?: string;
  image?: string;
  color?: string;
  label?: string;
  value: string;
  active: boolean;
}

export interface YoutubeMessage {
  parts: {
    emoji?: string;
    image?: string;
    text?: string;
  }[];
  user: {
    name: string;
    profileImageUrl: string;
  };
  publishedAt: string;
}

export interface AppConfig {
  server: {
    host: string;
    port: string;
  };
  actions: string;
}
