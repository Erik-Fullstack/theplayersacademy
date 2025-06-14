import { useRef, useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";

import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IOrganization } from "@/types/models/organization";
import { useApi } from "@/services/useApi";

// Custom hook for organization data
function useOrganizationData(orgId: string | null) {
  const api = useApi();

  const { data: usersData } = api.organizations.useOrganizationUsers(
    orgId || undefined,
  );
  const { data: seatsData } = api.seats.useOrganizationSeats({
    orgId: orgId || undefined,
  });
  const { data: teamsData } = api.teams.useByOrganization({
    organizationId: orgId || undefined,
  });
  const { data: coursesData } = api.orgcourses.useByOrganization(
    orgId || undefined,
  );
  const { data: subscriptionData } = api.subscriptions.useByOrganizationId(
    orgId || undefined,
  );

  return {
    users: usersData?.data,
    seats: seatsData?.data,
    teams: teamsData?.data,
    courses: coursesData?.data,
    subscription: subscriptionData?.data,
  };
}

// Stats card component
function StatCard({
  title,
  value,
  description,
  color = "",
}: {
  title: string;
  value: number;
  description: string;
  color?: string;
}) {
  return (
    <Card className={`border-none shadow-md bg-${color}`}>
      <CardBody>
        <div className="flex flex-col">
          <p className="text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs ">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}

// Organization info component
function OrganizationInfo({ org }: { org: IOrganization }) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div>
        <h5 className="font-medium">Admin:</h5>
        <p>{org.owner.fullName}</p>
      </div>
      <div>
        <h5 className="font-medium">Prenumeration:</h5>
        <Chip
          color={org.subscription?.status === "ACTIVE" ? "success" : "danger"}
          variant="flat"
        >
          {org.subscription?.status === "ACTIVE" ? "Aktiv" : "Inaktiv"}
        </Chip>
      </div>
    </div>
  );
}

export default function OrgTableModal({
  modalRef,
}: {
  modalRef: React.RefObject<GeneralModalRef>;
}) {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const orgRef = useRef<IOrganization | null>(null);
  const { users, seats, teams, courses } = useOrganizationData(currentOrgId);

  return (
    <div>
      <GeneralModal
        ref={modalRef}
        title={(data) => (data as IOrganization)?.name || "Föreningsdetaljer"}
      >
        {(data) => {
          const org = data as IOrganization;

          if (!org) return null;

          // Update ref and state
          orgRef.current = org;
          if (currentOrgId !== org.id) {
            setCurrentOrgId(org.id);
          }

          const stats = [
            {
              title: "Användare",
              value: users?.length || 0,
              description: "Aktiva tränare",
            },
            {
              title: "Platser",
              value: seats?.length || 0,
              description: `av ${org.subscription?.seatLimit || 0} möjliga`,
            },
            {
              title: "Lag",
              value: teams?.length || 0,
              description: "Totalt antal lag",
            },
            {
              title: "Kurser",
              value: courses?.length || 0,
              description: "Aktiva kurser",
            },
          ];

          return (
            <div className="flex gap-6">
              <OrganizationInfo org={org} />
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      </GeneralModal>
    </div>
  );
}
