import ProfileSettings from "@/app/my-account/ProfileSettings";
import Section from "@/components/layout/Section";
import ChangeRole from "@/components/testing/ChangeRole";

export default function Page() {
  return (
    <Section>
      <h1>Mitt konto</h1>
      <div className="mb-6">
        <ChangeRole />
      </div>
      <ProfileSettings />
    </Section>
  );
}
