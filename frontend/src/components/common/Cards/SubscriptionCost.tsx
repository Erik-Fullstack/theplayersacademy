import { useEffect, useState, useRef } from "react";

import StatsCard from "./StatsCard";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";
import GeneralModal, {
  GeneralModalRef,
} from "@/components/common/Modals/Modal";
import EditSubscriptionModal from "@/app/organization/settings/Subscription/EditSubscriptionModal";

export default function SubscriptionCost() {
  const subscriptionModalRef = useRef<GeneralModalRef>(null);

  const { user } = useUserStore();
  const seats = user?.organization?.subscription?.seatLimit || 0;

  const [price, setPrice] = useState<string>("0");

  useEffect(() => {
    fetchTotalCost();
  }, [user]);
  const fetchTotalCost = async () => {
    try {
      // TODO: fetch URLen ska uppdateras senare och byta ut yearly mot någon var med det valet orgen har (yearly/monthly) när funktionalitet finns
      const response = await fetch(`${API_BASE_URL}/prices/yearly/${seats}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data } = await response.json();

      setPrice(data);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <>
      <StatsCard
        centered
        buttons={[
          {
            label: "Ändra abonnemang",
            action: () => subscriptionModalRef.current?.open(),
          },
        ]}
      >
        <div className="flex flex-col text-center">
          <div className="text-3xl font-semibold">{seats} kursplatser</div>
          <div className="text-3xl font-semibold">{price}:-/mån</div>
        </div>
      </StatsCard>

      {/* Modal: Ändra abonnemang */}
      <GeneralModal ref={subscriptionModalRef} title="Ändra abonnemang">
        {(data) => <EditSubscriptionModal />}
      </GeneralModal>
    </>
  );
}
