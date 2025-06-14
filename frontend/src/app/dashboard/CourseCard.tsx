import { Link } from "react-router-dom";
import { Card, Button, CardBody, CardHeader } from "@heroui/react";

import Image from "@/assets/images/kenny-eliason-AvcBDbR-LWc-unsplash.jpg";
import { ICourse } from "@/types";

export default function CourseCard({ course }: { course: ICourse }) {
  return (
    <Card className="flex flex-row max-h-[250px] min-h-[200px]">
      <div className="w-7/12 p-4">
        <CardHeader className="flex justify-between">
          <h3 className="text-xl font-semibold">{course.name || "Kursnamn"}</h3>
        </CardHeader>
        <CardBody className="pt-4">
          <p className="overflow-hidden line-clamp-3">
            {course.description || "Beskrivning"}
          </p>
        </CardBody>
      </div>
      <div className="relative w-5/12">
        <img
          src={course.image || Image}
          className="absolute inset-0 w-full h-full object-cover"
          alt="fin bild"
        />
        <Link to={course.loginLink} target="_blank">
          <Button
            size="sm"
            color="warning"
            className="absolute bottom-4 right-4"
          >
            Öppna kursen
          </Button>
        </Link>
      </div>
    </Card>
  );
}
