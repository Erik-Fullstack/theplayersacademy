import { IUser } from "./user";
import { ISeat } from "./seat";
import { ITrainer } from "./trainer";

export interface ISeatStats {
  total: number;
  used: number;
  available: number;
  availabilityPercentage?: number;
}

export interface IOrganization {
  id: string;
  name: string;
  ownerId: string;
  subscription?: ISubscription | null;
  seats: ISeat[];
  users: ITrainer[];
  owner: IUser;
  profile: IOrgProfile;
  seatStats?: ISeatStats | null;
}

export interface IOrgProfile {
  id: string;
  organizationId: string;
  logo?: string | null;
  colors?: string | null;
  introText?: string | null;
}

export type SubStatus = "ACTIVE" | "INACTIVE";

export interface ISubscription {
  id: string;
  paymentInfo: string;
  pricePlan: string;
  seatLimit: number;
  organizationId: string;
  status: SubStatus;
  organization?: IOrganization;
}

export type PlanType = "MONTHLY" | "YEARLY";