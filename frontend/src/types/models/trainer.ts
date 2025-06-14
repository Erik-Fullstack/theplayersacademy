import { ITeam } from "./team";

export interface ITrainer {
  firstName: string;
  lastName: string;
  courses: string[];
  teams: ITeam[];
  email: string;
  id: string;
}
