import { useEffect, useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";

import { useApi } from "@/services/useApi";
import { ICourse } from "@/types/models/course";

interface CourseStatsCardProps {
  course: ICourse;
  onClose: () => void;
}

export default function CourseStatsCard({
  course,
  onClose,
}: CourseStatsCardProps) {
  const api = useApi();
  const [assignedUsers, setAssignedUsers] = useState<number>(0);
  const [orgCount, setOrgCount] = useState<number>(0);

  // Fetch assigned users for the course
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = api.courses.useCourseUsers({
    courseId: course.id,
  });

  // Fetch organization courses to count how many orgs use this course
  const {
    data: orgCoursesData,
    isLoading: isLoadingOrgs,
    error: orgsError,
  } = api.orgcourses.useList();

  useEffect(() => {
    if (usersData?.data) {
      setAssignedUsers(usersData.data.length);
    }
  }, [usersData]);

  useEffect(() => {
    if (orgCoursesData?.data) {
      const courseOrgs = orgCoursesData.data.filter(
        (orgCourse) => orgCourse.courseId === course.id,
      );

      setOrgCount(courseOrgs.length);
    }
  }, [orgCoursesData, course.id]);

  if (isLoadingUsers || isLoadingOrgs) {
    return (
      <Card>
        <CardBody>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-4">Statistik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-branding1 p-4 rounded-lg">
                <p className="text-sm text-white">Laddar...</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (usersError || orgsError) {
    return (
      <Card>
        <CardBody>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-4">Statistik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-branding1 p-4 rounded-lg">
                <p className="text-sm text-white">Kunde inte ladda statistik</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-branding1">
      <CardBody>
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 text-branding1">
            Statistik
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-branding3/10 p-4 rounded-lg">
              <p className="text-sm text-branding3">Tilldelade användare</p>
              <p className="text-2xl font-semibold text-branding1">
                {assignedUsers}
              </p>
            </div>
            <div className="bg-branding3/10 p-4 rounded-lg">
              <p className="text-sm text-branding3">Används av föreningar</p>
              <p className="text-2xl font-semibold text-branding1">
                {orgCount}
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            aria-label="Stäng"
            variant="light"
            className="absolute top-0 right-0 text-branding3"
            onPress={onClose}
          >
            ✕
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
