import { useRef, useState } from "react";

import { createOrgTableColumns } from "./OrgTableColumns";
import { filterOrgs, sortOrgs } from "./OrgTableUtils";
import OrgTableModal from "./OrgTableModal";
import CreateOrgModal from "./CreateOrgModal";

import { IOrganization } from "@/types/models/organization";
import DataTable from "@/components/common/DataTable";
import { useTableActions } from "@/components/common/DataTable/hooks";
import { GeneralModalRef } from "@/components/common/Modals/Modal";

export default function OrgTable({ orgs }: { orgs: IOrganization[] }) {
  const modalRef = useRef<GeneralModalRef>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Setup table actions
  const { handleEdit } = useTableActions<IOrganization>(orgs, {
    onEdit: (org) => modalRef.current?.open(org),
  });

  const columns = createOrgTableColumns(handleEdit);

  return (
    <>
      <DataTable<IOrganization>
        dark
        items={orgs}
        columns={columns}
        getRowKey={(item) => item.id}
        initialSortDescriptor={{ column: "name", direction: "ascending" }}
        title="Föreningar"
        searchPlaceholder="Sök föreningar..."
        noDataContent="Inga föreningar hittades"
        loadingContent="Laddar föreningar..."
        filterFunction={filterOrgs}
        sortFunction={sortOrgs}
        // actionButtons={
        //   <Button
        //     color="primary"
        //     onPress={() => setIsCreateModalOpen(true)}
        //   >
        //     Skapa ny förening
        //   </Button>
        // }
        // selectionMode="multiple"
        // selectionActions={selectionActions}
      />
      <OrgTableModal modalRef={modalRef} />
      <CreateOrgModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
