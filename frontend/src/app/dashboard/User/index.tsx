import MyCourses from "../UserCourses";

import WelcomeMessage from "@/app/dashboard/WelcomeMessage";
import Section from "@/components/layout/Section";
import ChangeRole from "@/components/testing/ChangeRole";

export default function Page() {
  return (
    <>
      <WelcomeMessage />
      <Section>
        <ChangeRole />
      </Section>
      <Section className="bg-branding3">
        <MyCourses />
      </Section>
    </>
  );
}
