import Section from "@/components/layout/Section";
import CourseTable from "@/app/superadmin/EditCourses/CourseTable";
import { useApi } from "@/services/useApi";

export default function Page() {
  const api = useApi();
  const { data: courseResponse } = api.courses.useList();
  const courses = courseResponse?.data || [];

  return (
    <>
      <Section>
        <h1>Hantera kurser</h1>
      </Section>
      <Section className="bg-branding3">
        <CourseTable courses={courses} />
      </Section>
    </>
  );
}
