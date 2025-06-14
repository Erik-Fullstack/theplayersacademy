import { useRef } from "react";
import { CircularProgress } from "@heroui/react";
import clsx from "clsx";

import StatsCard from "./StatsCard";
import GeneralModal, { GeneralModalRef } from "../Modals/Modal";
import SeatsModal from "../../../app/organization/courses/SeatsModal";

import useUserStore from "@/store/useUserStore";

export default function AvailableSeats({ className }: { className?: string }) {
  const seatsModalRef = useRef<GeneralModalRef>(null);

  const { user } = useUserStore();
  const seatStats = user?.organization?.seatStats;
  const seatLimit = seatStats?.total || 0;
  const usedSeats = seatStats?.used || 0;
  const availableSeats = seatStats?.available || 0;

  return (
    <>
      <StatsCard
        buttons={[
          {
            label: "Hantera kursplatser",
            classes: "bg-orange-700",
            action: () => seatsModalRef.current?.open(),
          },
        ]}
        className={clsx("bg-transparent", className)}
      >
        <div className="flex justify-between">
          <div>
            <div className="text-xl font-bold">Kursplatser</div>
            <div>
              <span className="font-semibold">Totalt:</span> {seatLimit} st
            </div>
            <div>
              <span className="font-semibold">Använda:</span> {usedSeats} st
            </div>
            <div>
              <span className="font-semibold">Lediga:</span> {availableSeats} st
            </div>
          </div>

          <CircularProgress
            classNames={{
              svg: "w-28 h-28",
            }}
            strokeWidth={5}
            color="success"
            aria-label="Antal kursplatser"
            value={(usedSeats / seatLimit) * 100}
          />
        </div>
      </StatsCard>

      {/* Modal: Hantera kursplatser */}
      <GeneralModal ref={seatsModalRef} title="Hantera kursplatser" size="md">
        {() => <SeatsModal />}
      </GeneralModal>
    </>
  );
}
