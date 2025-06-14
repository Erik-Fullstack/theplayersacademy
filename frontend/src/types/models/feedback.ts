export enum FeedbackCategory {
  BUG = "BUG",
  SUGGESTION = "SUGGESTION",
  OTHER = "OTHER",
}

export interface IFeedback {
  id: string;
  userId?: string | null;
  email?: string | null;
  category: FeedbackCategory;
  message: string;
  rating: number;
  createdAt: string;
  isResolved: boolean;
}
