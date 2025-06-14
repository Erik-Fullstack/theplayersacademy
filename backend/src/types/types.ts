import { IUser, Organization } from "./models";

export interface FileWithCategory extends Express.Multer.File {
    category?: string;
  }

export interface LightweightUser extends Omit<IUser, 'organization'> {
  organization?: Pick<Organization, "id" | "name"> & {
    seatStats?: {
    total: number;
    used: number;
    available: number;
    availabilityPercentage: number;
  };
}
}

export interface UploadPayload {
  title?: string;
  description?: string;
  fileURL?: string;
  imgURL?: string | null;
};