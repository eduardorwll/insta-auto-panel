export interface Company {
  id: string;
  name: string;
  instagramHandle: string;
  niche: string;
  toneOfVoice: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  accentColor?: string | null;
  whatsappNumber?: string | null;
  whatsappDefaultMessage?: string | null;
  websiteUrl?: string | null;
  canvaTemplateId?: string | null;
  createdAt?: string | number | null;
}

export type CompanyFormData = Omit<Company, "createdAt">;
