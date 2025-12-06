// AI Staging Types

export type InteriorStyle =
  | 'modern'
  | 'minimalist'
  | 'scandinavian'
  | 'industrial'
  | 'classic'
  | 'contemporary'
  | 'loft'
  | 'rustic';

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'dining_room';

export interface StagingRequest {
  imageBase64: string;
  style: InteriorStyle;
  roomType?: RoomType;
  propertyId?: string;
  strength?: number;
  guidanceScale?: number;
}

export interface StagingResponse {
  success: boolean;
  imageUrl?: string;
  provider?: 'huggingface' | 'replicate' | 'pollinations';
  warning?: string;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime?: number;
    style?: InteriorStyle;
    roomType?: RoomType;
  };
}

export interface StagingLog {
  id: string;
  timestamp: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  style: InteriorStyle;
  roomType?: RoomType;
  propertyId?: string;
  userId?: string;
  provider?: string;
}

export interface StyleOption {
  id: InteriorStyle;
  name: string;
  description: string;
}

export interface RoomTypeOption {
  id: RoomType;
  name: string;
}
