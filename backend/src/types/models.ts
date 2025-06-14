export type Role = "USER" | "ADMIN" | "SUPERADMIN";

export interface Profile {
  name: string,
  given_name: string,
  family_name: string,
  email: string,
  email_verified: boolean,
  id: string,
}

export interface SerializeUser extends Express.User  {
  id?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  status?: boolean;
  role?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  learnifierId: string;
  format?: "THREE" | "FIVE" | "SEVEN" | "NINE" | "ELEVEN";
}

export interface InvitationCode {
  id: string;
  email: string;
  code: string;
  organizationId: string;
  userRole: Role; // 'USER' | 'ADMIN' | 'SUPERADMIN' 
  
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  owner: IUser;
  users: IUser[];
  courses: OrgCourse[];
  seats: Seat[];
  profile?: OrgProfile;
  subscription?: Subscription;
  invitationCode: InvitationCode[];
  seatStats?: object;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage?: string | null;
  learnifierId?: string | null; 
  organizationId?: string | null;
  organization?: Organization | null;
  seat?: Seat;
  ownedOrganizations?: Organization;
  teams?: ITeam[]
  assignedCourses?: Course[];
  courses?: Course[];
  fullName?: string;
}

export interface ITeam {
  id: string;
  year: number;
  gender: string;
  organizationId: string | null;
  organization?: Organization;
  coaches?: IUser[];
  gameFormatId?: string | null;
  gameFormat?: IGameFormat | null;
  courses: Course[];
}


export interface IGameFormat {
  id: string;
  name: string;
  ages: number[];
  course: Course[];
  team: ITeam[];
}


export interface OrgCourse {
  id: string;
  introText: string;
  courseId: string;
  course: Course;
  assignedUsers: IUser[];
  organizationId?: string;
  Organization?: Organization;
}

export interface Seat {
  id: string;
  userId: string;
  user: IUser;
  organizationId?: string;
  Organization?: Organization;
}

export interface Subscription {
  id: string;
  paymentInfo: string;
  seatLimit: number;
  organizationId: string;
  organization: object;
}

export interface OrgProfile {
  id: string;
  logo: string;
  colors: string;
  introText: string;
  organizationId: string;
  organization: Organization;
}

export interface LearnifierProject
{
  projectName: string;
  loginlink: string;
  learnifierId: string;
}
export interface Project
{
  projectName: string;
  id: string;
  projectId: string;
}