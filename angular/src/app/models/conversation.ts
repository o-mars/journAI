export interface FormattedData {
  output?: string;
  tool?: { name: string; arguments: string };
  transcript?: string;
  audio?: string[];
  text?: string;
  file?: { url: string };
}

export interface ConversationItem {
  id: string;
  role?: string;
  type?: string;
  formatted: FormattedData;
}
