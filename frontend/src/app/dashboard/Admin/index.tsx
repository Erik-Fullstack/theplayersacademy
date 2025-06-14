import WelcomeMessage from "@/app/dashboard/WelcomeMessage";
import Section from "@/components/layout/Section";
import StatisticsCard from "@/components/common/Cards/StatisticsCard";
import SeatsCard from "@/components/common/Cards/SeatsCard";
import ChangeRole from "@/components/testing/ChangeRole";
import MyCourses from "@/app/dashboard/UserCourses";

export default function AdminDashboard() {
  return (
    <>
      <WelcomeMessage />
      <Section>
        <ChangeRole />
      </Section>
      <Section className="bg-branding3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatisticsCard />
          <SeatsCard className="bg-white" />
        </div>
      </Section>
      <Section className="bg-branding3">
        <MyCourses />
      </Section>
    </>
  );
}
