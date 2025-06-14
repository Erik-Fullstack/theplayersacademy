import { IOrganization } from "./organization";
import { ITeam } from "./team";
import { ICourse } from "./course";
import { IOrgCourse } from "./orgCourse";
import { IFeedback } from "./feedback";
import { ISeat } from "./seat";

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  password?: string;
  organizationId?: string;
  organization?: IOrganization;
  role?: string;
  courses?: ICourse[];
  OrgCourse?: IOrgCourse[];
  teams?: ITeam[];
  profileImage: string;
  feedback?: IFeedback[];
  seat?: ISeat;
}
