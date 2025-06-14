import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tooltip,
} from "@heroui/react";
import { MdLogin } from "react-icons/md";
import { Icon } from "@iconify/react";
import { useState } from "react";

import { Column } from "@/components/common/DataTable";
import { IOrganization } from "@/types/models/organization";
import { useApi } from "@/services/useApi";
import logo from "@/assets/logo_02.svg";

function UserCountCell({ orgId }: { orgId: string }) {
  const api = useApi();
  const { data: usersData } = api.organizations.useOrganizationUsers(orgId);

  return (
    <div className="flex items-center gap-2">
      <img src={logo} alt="Users" className="w-4 h-4" />
      <span>{usersData?.data?.length || 0}</span>
    </div>
  );
}

function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          color="primary"
          variant="light"
          onPress={() => setIsModalOpen(true)}
        >
          <MdLogin className="w-4 h-4" />
        </Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Currently under development</ModalHeader>
          <ModalBody>
            <p>This feature is currently under development</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export function createOrgTableColumns(
  onEdit: (org: IOrganization) => void,
): Column<IOrganization>[] {
  return [
    { name: "Namn", uid: "name", sortable: true },
    {
      name: "Antal användare",
      uid: "userCount",
      sortable: true,
      renderCell: (org) => <UserCountCell orgId={org.id} />,
    },
    {
      name: "Status",
      uid: "status",
      sortable: true,
      renderCell: (org) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            org.subscription?.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {org.subscription?.status === "ACTIVE" ? "Aktiv" : "Inaktiv"}
        </span>
      ),
    },
    {
      name: "",
      uid: "view",
      renderCell: (org) => (
        <div className="flex justify-end">
          <Tooltip content="Visa föreningsinfo">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => onEdit(org)}
            >
              <Icon
                icon="heroicons:information-circle"
                className="text-2xl text-branding1"
              />
            </Button>
          </Tooltip>
        </div>
      ),
    },
    // {
    //   name: "Logga in som admin",
    //   uid: "login",
    //   renderCell: () => <LoginButton />,
    // },
  ];
}
