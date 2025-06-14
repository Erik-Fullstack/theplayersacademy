import { useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tab, Tabs } from "@heroui/react";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import { IOrgCourse } from "@/types";
import Section from "@/components/layout/Section";
import CourseCard from "@/app/organization/courses/CourseCard";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import CourseCoaches from "@/app/organization/courses/CourseCoaches";
import CourseTeams from "@/app/organization/courses/CourseTeams";

function CourseTabs({ course }: { course: IOrgCourse }) {
  return (
    <>
      <p>{course.introText}</p>
      <Tabs>
        <Tab key="coaches" title="Tränare">
          <CourseCoaches course={course} />
        </Tab>
        <Tab key="teams" title="Lag">
          <CourseTeams course={course} />
        </Tab>
      </Tabs>
    </>
  );
}

export default function Courses() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const api = useApi();
  const orgId = user?.organization?.id;
  const modalRef = useRef<GeneralModalRef>(null);

  const {
    data: courseResponse,
    isLoading,
    isError,
    error,
  } = api.orgcourses.useByOrganization(orgId);

  const courses = courseResponse?.data || [];

  const { data: courseStats, isLoading: isLoadingStats } =
    api.courses.useCourseStats(user?.organizationId);

  const courseStatsMap = useMemo(() => {
    const map: Record<string, { teamCount: number; coachCount: number }> = {};

    const statsData = (courseStats as any)?.data || [];

    statsData.forEach((stat: any) => {
      map[stat.courseId] = {
        teamCount: stat.teamCount,
        coachCount: stat.coachCount,
      };
    });

    return map;
  }, [courseStats]);

  const getCoachCount = (courseId: string) => {
    return courseStatsMap[courseId]?.coachCount || 0;
  };

  const getTeamCount = (courseId: string) => {
    return courseStatsMap[courseId]?.teamCount || 0;
  };

  const handleOpenCourse = (course: IOrgCourse) => {
    modalRef.current?.open(course);
  };

  if (!orgId) return <Section>Kunde inte hitta några kurser.</Section>;
  if (isLoading) return <Section>Laddar kurser...</Section>;
  if (isError) return <Section>Fel: {error.message}</Section>;

  return (
    <>
      <Section>
        <h1>Kurser</h1>
      </Section>

      <Section className="bg-branding3">
        <div className="flex flex-col gap-8">
          {courses.map((course: IOrgCourse) => (
            <CourseCard
              key={`course-${course.id}`}
              courseId={course.course.id}
              title={course.course.name}
              description={course.introText}
              className="bg-white"
              isAllAccess={course.allAccess}
              teamCount={getTeamCount(course.course.id)}
              coachCount={getCoachCount(course.course.id)}
              onManage={() => handleOpenCourse(course)}
              onCoachAdded={() => {
                queryClient.invalidateQueries({ queryKey: ["course-stats"] });
                queryClient.invalidateQueries({
                  queryKey: ["users", "course"],
                });
                queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
              }}
            />
          ))}
        </div>
      </Section>

      <GeneralModal ref={modalRef} title="Hantera kurs">
        {(data) => <CourseTabs course={data as IOrgCourse} />}
      </GeneralModal>
    </>
  );
}
