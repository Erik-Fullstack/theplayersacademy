import Section from "@/components/layout/Section";
import EditPrices from "@/app/superadmin/EditPrices/EditPrices";

export default function Page() {
  return (
    <Section>
      <h1>Hantera priser</h1>
      <EditPrices />
    </Section>
  );
}
