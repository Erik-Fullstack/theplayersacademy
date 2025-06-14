import { useEffect, useState } from "react";

import CourseCard from "./CourseCard";

import useUserStore from "@/store/useUserStore";
import { ICourse, IUser } from "@/types";
import { useApi } from "@/services/useApi";
import apiClient from "@/services/api/client";

export default function MyCourses() {
  const { user } = useUserStore();
  const myCoursesPClassNames = "text-white mb-3";
  const api = useApi();
  const { data: userData, isLoading } = api.users.useById(user?.id);
  const [courseData, setCourseData] = useState<ICourse[] | undefined>([]);
  const [hasSeat, setHasSeat] = useState<boolean>(false);

  useEffect(() => {
    const getCourseData = async () => {
      try {
        const response = await apiClient<{ data: IUser }>(`me`);

        if (response && response.data) {
          const userHasSeat = !!response.data.seat;

          setHasSeat(userHasSeat);

          // Only set course data if user is assigned to a seat
          if (userHasSeat && response.data.courses) {
            setCourseData(response.data.courses);
          } else {
            setCourseData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCourseData([]);
      }
    };

    getCourseData();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-[805px] flex flex-col">
        <h2 className={myCoursesPClassNames + " m-auto"}>Mina kurser</h2>
        <div className="flex flex-col gap-4 max-w-[805px] m-auto">
          {isLoading ? (
            <p className="text-white">Laddar kurser...</p>
          ) : courseData && courseData.length > 0 ? (
            courseData.map((course: ICourse) => (
              <CourseCard key={course.id || course.name} course={course} />
            ))
          ) : (
            <div className="text-white text-center">
              <p>
                {!hasSeat
                  ? "Du är inte tilldelad en kursplats."
                  : "Du har för tillfället inte tillgång till några kurser."}
              </p>
              <p className="mt-2">
                Vänligen kontakta din föreningsadministratör.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
