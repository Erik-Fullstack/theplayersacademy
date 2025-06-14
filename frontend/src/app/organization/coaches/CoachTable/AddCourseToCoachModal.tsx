import { useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/services/useApi";
import { IUser, ICourse } from "@/types";
import SelectItemModal from "@/components/common/Modals/SelectItemModal";

export default function AddCourseModal({
  user,
  onSuccess,
}: {
  user: IUser;
  onSuccess?: () => void;
}) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get all courses
  const { data: coursesResponse, isLoading: isLoadingCourses } =
    api.courses.useList();

  // Get mutation for assigning a course
  const { mutate: assignCourse } = api.courses.useAssignUserToCourse();

  // Handle adding a course to a user
  const handleAddCourse = async (courseId: string, userId: string) => {
    return new Promise((resolve, reject) => {
      assignCourse(
        { courseId, userId },
        {
          onSuccess: () => {
            // Invalidate any user-related queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["users", userId] });
            queryClient.invalidateQueries({ queryKey: ["filtered-users"] });

            // Resolve the promise to indicate success
            resolve(true);

            // Call the success callback if provided
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            console.error("Error assigning course:", err);
            reject(err);
          },
        },
      );
    });
  };

  // Filter out courses the user already has
  const availableCourses = (coursesResponse?.data || []).filter(
    (course) =>
      !user.courses?.some((userCourse) => userCourse.id === course.id),
  );

  return (
    <SelectItemModal<ICourse>
      user={user}
      title="Välj kurs"
      emptyMessage="Inga tillgängliga kurser att lägga till"
      loadingMessage="Laddar kurser..."
      buttonText="Lägg till kurs"
      successTitle="Kurs tillagd"
      successMessageTemplate={`${user.firstName} har tilldelats kursen {item}`}
      items={availableCourses}
      isLoading={isLoadingCourses}
      getItemLabel={(course) => course.name}
      getItemValue={(course) => course.id}
      userItems={user.courses}
      shouldRefreshUser={true}
      onAddItem={handleAddCourse}
      onSuccess={onSuccess}
    />
  );
}
