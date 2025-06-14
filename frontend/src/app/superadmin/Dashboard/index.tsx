import { useState, useEffect } from "react";

import { API_BASE_URL } from "@/config/api";
import Section from "@/components/layout/Section";
import InfoCard from "@/app/superadmin/Dashboard/InfoCard";
import RevenueStats from "@/app/superadmin/Dashboard/RevenueStats";
import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";
import ChangeRole from "@/components/testing/ChangeRole";

export default function Page() {
  const { user } = useUserStore();
  const api = useApi();
  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState<number>(0);

  const {
    data: userResponse,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = api.users.useList();

  const {
    data: orgsResponse,
    isLoading: isOrgsLoading,
    isError: isOrgsError,
    error: orgsError,
  } = api.organizations.useList();

  const users = userResponse?.data || [];
  const orgs = orgsResponse?.data || [];

  const totalSeats = orgs.reduce((sum, org) => {
    return sum + (org.subscription?.seatLimit || 0);
  }, 0);

  useEffect(() => {
    const fetchRevenue = async () => {
      if (totalSeats === 0) return;

      try {
        const res = await fetch(`${API_BASE_URL}/prices/monthly/${totalSeats}`);
        const { data } = await res.json();

        setTotalMonthlyRevenue(Number(data));
      } catch (err) {
        console.error("Kunde inte hämta månadsinkomst:", err);
      }
    };

    fetchRevenue();
  }, [totalSeats]);

  if (isUsersLoading || isOrgsLoading) return <>Laddar data...</>;

  if (isUsersError)
    return <>Fel vid hämtning av användare: {usersError.message}</>;
  if (isOrgsError)
    return <>Fel vid hämtning av föreningar: {orgsError.message}</>;

  const yearlyRevenue = totalMonthlyRevenue * 12;

  return (
    <>
      <Section>
        <h1 className="text-branding1 m-0">The Players Academy</h1>
        <p className="font-medium text-lg mb-6">
          Välkommen åter, {user?.firstName}!
        </p>

        <div className="mb-6">
          <ChangeRole />
        </div>

        <article className="flex flex-col sm:flex-row gap-4 w-full mb-10 ">
          <InfoCard
            title="Föreningar"
            number={orgs.length}
            footerText="registrerade"
          />
          <InfoCard
            title="Användare"
            number={users.length}
            footerText="registrerade"
          />
          <InfoCard title="Kursplatser" number={532} footerText="slutförda" />
        </article>
        <article className="flex flex-col gap-4">
          <RevenueStats
            title="Betalande platser"
            number={totalSeats}
            unit="st"
          />
          <RevenueStats
            title="Total inkomst"
            number={yearlyRevenue}
            unit="kr/år"
          />
        </article>
      </Section>
    </>
  );
}
