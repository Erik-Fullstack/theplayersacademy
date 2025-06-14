import Section from "@/components/layout/Section";
import AvailableSeats from "@/components/common/Cards/AvailableSeatsCard";
import PaymentMethod from "@/app/organization/settings/Subscription/PaymentMethod";
import PaymentsList from "@/app/organization/settings/Subscription/PaymentsList";
import PaymentsListMobile from "@/app/organization/settings/Subscription/PaymentListMobile";
import SubscriptionCost from "@/components/common/Cards/SubscriptionCost";

export default function Page() {
  return (
    <>
      <Section>
        <h1 className="mb-8">Hantera abonnemang</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SubscriptionCost />
          <AvailableSeats />
        </div>
      </Section>

      <Section className="bg-branding3">
        <h2 className="text-white mb-4">Betalningsmetod</h2>
        <PaymentMethod />
        <h2 className="text-white mb-4">Tidigare betalningar</h2>
        <PaymentsListMobile />
        <PaymentsList />
      </Section>
    </>
  );
}
