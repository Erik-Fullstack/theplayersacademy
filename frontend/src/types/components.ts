import { MutableRefObject } from "react";

import { IFeedback } from "./models";

import { GeneralModalRef } from "@/components/common/Modals/Modal";

export interface ITrainingCard {
  title: string;
  description: string;
  tags: string[];
  link: string;
  progress: number;
}

export interface DescriptionEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface FeedbackFormData {
  category: "BUG" | "SUGGESTION" | "OTHER";
  message: string;
  rating: number;
  email?: string;
}

export interface FeedbackFormProps {
  modalRef: React.RefObject<GeneralModalRef>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface RatingProps {
  value: number;
  onChange: (value: number) => void;
}

export interface superadminCardProps {
  title: string;
  number: number;
  footerText?: string;
  unit?: string;
}

export interface CreateDocumentFormData {
  title: string;
  description: string;
  fileURL: string;
  imgURL?: string;
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fileURL: string;
  imgURL?: string;
}

export interface AddingDocumentFormProps {
  modalRef: React.RefObject<GeneralModalRef>;
}

export interface EditDocumentWithFormProps {
  modalRef: React.RefObject<GeneralModalRef>;
  documentData: FormData;
}

export interface AddDocumentWithFormProps {
  modalRef: MutableRefObject<GeneralModalRef | null>;
  documentData?: FormData;
}

export interface InboxProps {
  feedback: IFeedback[];
  onOpen: (msg: IFeedback) => void;
  selected: IFeedback | null;
}

export interface OpenMessageProps {
  feedback: IFeedback;
}
