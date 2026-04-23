export interface ExtractedMovePair {
  moveNumber: number;
  white: string;
  black?: string;
}

export interface ExtractorMetadata {
  model: string;
  fallbackUsed?: boolean;
  timestamp: string;
}

export interface ExtractorResponseData {
  moves: ExtractedMovePair[];
  totalSheets?: number;
  _metadata: ExtractorMetadata;
}

export interface ExtractorResponse {
  success: true;
  data: ExtractorResponseData;
}

export interface ExtractorError {
  success: false;
  error: string;
  message?: string;
}

export type ExtractorResult = ExtractorResponse | ExtractorError;
