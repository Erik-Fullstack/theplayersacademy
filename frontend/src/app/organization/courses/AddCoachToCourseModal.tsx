import { useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/services/useApi";
import { ICourse, IUser } from "@/types";
import SelectItemModal from "@/components/common/Modals/SelectItemModal";
import useUserStore from "@/store/useUserStore";

export default function AddCoachToCourseModal({
  course,
  onSuccess,
}: {
  course: ICourse;
  onSuccess?: () => void;
}) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user: currentUser } = useUserStore();
  const organizationId = currentUser?.organizationId;

  // Get all users from the same organization
  const { data: usersResponse, isLoading: isLoadingUsers } =
    api.users.useFilterUsers({
      organizationId,
      include: "courses",
    });

  // Get mutation for assigning a user to a course
  const { mutate: assignUserToCourse } = api.courses.useAssignUserToCourse();

  // Handle adding a coach to the course
  const handleAddCoach = async (userId: string, courseId: string) => {
    return new Promise((resolve, reject) => {
      assignUserToCourse(
        { courseId, userId },
        {
          onSuccess: () => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course-stats"] });
            queryClient.invalidateQueries({ queryKey: ["orgcourses"] });

            queryClient.invalidateQueries({
              queryKey: ["users", "course", courseId],
            });
            queryClient.invalidateQueries({
              queryKey: ["users", "course", courseId, organizationId],
            });

            resolve(true);
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            console.error("Error assigning coach to course:", err);
            reject(err);
          },
        },
      );
    });
  };

  // Only show coaches with a seat and who aren't already assigned to this course
  const availableCoaches = (usersResponse?.data || []).filter(
    (user) =>
      // Must have a seat to access courses
      user.seat &&
      // Must not already be assigned to this course
      !user.courses?.some((userCourse) => userCourse.id === course.id),
  );

  return (
    <SelectItemModal<IUser>
      user={currentUser as IUser}
      title="Välj tränare"
      emptyMessage="Inga tillgängliga tränare att lägga till"
      loadingMessage="Laddar tränare..."
      buttonText="Lägg till tränare"
      successTitle="Tränare tillagd"
      successMessageTemplate={`{item} har lagts till i kursen ${course.name}`}
      items={availableCoaches}
      isLoading={isLoadingUsers}
      getItemLabel={(user) => `${user.firstName} ${user.lastName}`}
      getItemValue={(user) => user.id}
      userItems={[]}
      shouldRefreshUser={false}
      onAddItem={(userId, _) => handleAddCoach(userId, course.id)}
      onSuccess={onSuccess}
    />
  );
}
