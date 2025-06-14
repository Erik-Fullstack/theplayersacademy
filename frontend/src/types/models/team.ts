import { IUser } from "./user";

export interface ITeam {
  id: string;
  year: number;
  gender: string;
  organizationId: string;
  coaches: IUser[];
  gameFormatId?: string | undefined;
  format?: GameFormat;
}

interface GameFormat {
  id: string;
  name: string;
  ages: number[];
}

export interface TeamTableProps {
  teams: ITeam[];
}
