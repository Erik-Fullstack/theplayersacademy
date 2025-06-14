import { Card, CardBody } from "@heroui/react";

import { ICourse } from "@/types/models/course";

interface CourseDetailsCardProps {
  course: ICourse;
}

export default function CourseDetailsCard({ course }: CourseDetailsCardProps) {
  return (
    <Card className="bg-white border border-branding1">
      <CardBody>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-branding1">
            Kurs: {course.name}
          </h3>
          <p className="text-sm text-branding3 mb-4">{course.description}</p>
          <p className="text-sm text-branding3">
            Learnifier ID: {course.learnifierId}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
