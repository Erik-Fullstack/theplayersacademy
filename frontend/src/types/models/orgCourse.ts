import { ICourse } from "./course";

export interface IOrgCourse {
  id: string;
  introText: string;
  courseId: string;
  course: ICourse;
  organizationId?: string;
  allAccess?: boolean;
}
