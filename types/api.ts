// 検品・撮影フローに関する型定義

export interface ProductMetadata {
  inspectionCompleted?: boolean;
  inspectionDate?: string;
  photographyCompleted?: boolean;
  photographyDate?: string;
  skipPhotography?: boolean;
  photographyBy?: string;
  [key: string]: any; // その他のメタデータ
}

export interface InspectionData {
  productId: string;
  checklist: {
    exterior: {
      scratches: boolean;
      dents: boolean;
      discoloration: boolean;
      dust: boolean;
    };
    functionality: {
      powerOn: boolean;
      allButtonsWork: boolean;
      screenDisplay: boolean;
      connectivity: boolean;
    };
    optical?: {
      lensClarity: boolean;
      aperture: boolean;
      focusAccuracy: boolean;
      stabilization: boolean;
    };
  };
  photos: string[];
  notes: string;
  inspectionDate: string;
  inspectorId: string;
  result: 'passed' | 'failed' | 'conditional';
  skipPhotography?: boolean;
}

export interface PhotographyData {
  productId: string;
  photos: string[];
  notes?: string;
  photographyDate: string;
  photographyBy: string;
}

// API レスポンス型
export interface InspectionApiResponse {
  success: boolean;
  product: any; // Product型
  message: string;
}

export interface PhotographyApiResponse {
  success: boolean;
  product: any; // Product型
  message: string;
}