import { Button, Selection } from "@heroui/react";
import { useRef, useState } from "react";

import { createCourseTableColumns } from "./CourseTableColumns";
import CourseTableModal from "./CourseTableModal";
import CourseDetailsCard from "./CourseDetailsCard";
import CourseStatsCard from "./CourseStatsCard";

import { ICourse } from "@/types/models/course";
import { GeneralModalRef } from "@/components/common/Modals/Modal";
import DataTable from "@/components/common/DataTable/DataTable";

function useCoursesColumns(modalRef: React.RefObject<GeneralModalRef>) {
  return () => createCourseTableColumns(modalRef);
}

export default function CourseTable({ courses }: { courses: ICourse[] }) {
  const modalRef = useRef<GeneralModalRef>(null);
  const getColumns = useCoursesColumns(modalRef);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(
    courses.length > 0 ? courses[0] : null,
  );

  const handleSelectionChange = (selection: Selection) => {
    if (selection === "all" || selection.size === 0) {
      setSelectedCourse(null);

      return;
    }
    const selectedId = Array.from(selection)[0];
    const course = courses.find((c) => c.id === selectedId);

    setSelectedCourse(course || null);
  };

  return (
    <>
      {selectedCourse && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <CourseDetailsCard course={selectedCourse} />
          <CourseStatsCard
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        </div>
      )}
      <DataTable<ICourse>
        dark
        items={courses}
        columns={getColumns()}
        getRowKey={(item) => item.id}
        selectionMode="single"
        title="Kurser"
        searchPlaceholder="Sök kurser..."
        noDataContent="Inga kurser hittades"
        loadingContent="Laddar kurser..."
        actionButtons={
          <Button
            color="warning"
            variant="solid"
            onPress={() => modalRef.current?.open()}
          >
            + Lägg till kurs
          </Button>
        }
        onSelectionChange={handleSelectionChange}
      />
      <CourseTableModal modalRef={modalRef} />
    </>
  );
}
