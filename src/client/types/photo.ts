export type PhotoCategory = "Especialista" | "Produto" | "Logo" | "Fundo";

export interface PhotoAsset {
  id: string;
  companyId: string;
  filename: string;
  originalName: string;
  filePath: string;
  category: PhotoCategory;
  tags?: string | null;
  timesUsed?: number;
  uploadedAt?: string | number | null;
}
