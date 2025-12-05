// AI Staging Types

export type InteriorStyle =
  | 'modern'
  | 'minimalist'
  | 'industrial'
  | 'scandinavian'
  | 'classic'
  | 'loft'
  | 'rustic'
  | 'contemporary';

export interface StagingRequest {
  imageUrl: string;
  style: InteriorStyle;
  prompt?: string;
  propertyId?: string;
}

export interface StagingResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime?: number;
  };
}

export interface StagingLog {
  id: string;
  timestamp: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  style: InteriorStyle;
  prompt?: string;
  propertyId?: string;
  userId?: string;
}
