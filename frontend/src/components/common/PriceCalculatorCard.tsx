import { useEffect, useState } from "react";
import { Card, CardBody, Select, SelectItem, Tabs, Tab } from "@heroui/react";

import { API_BASE_URL } from "@/config/api";

export default function PriceCalculatorCard() {
  const [seats, setSeats] = useState(25);
  const [period, setPeriod] = useState("monthly");
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [yearlyPrice, setYearlyPrice] = useState(0);

  useEffect(() => {
    monthlyPriceFetch();
    yearlyPriceFetch();
  }, [period, seats]);
  const monthlyPriceFetch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices/monthly`);
      const { data } = await response.json();

      setMonthlyPrice(Number(data));
    } catch (err) {
      console.log(err);
    }
  };
  const yearlyPriceFetch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices/yearly`);
      const { data } = await response.json();

      setYearlyPrice(Number(data));
    } catch (err) {
      console.log(err);
    }
  };
  const seatPrice = period === "monthly" ? monthlyPrice : yearlyPrice;
  const priceToDisplay = seats * seatPrice;

  return (
    <Card
      className="bg-branding2 p-4 border-small border-branding3 shadow-md shadow-stone-300 rounded-medium"
      aria-label="Kalkulera priser"
    >
      <CardBody className="flex flex-col sm:flex-row 0 gap-4">
        <div className="flex flex-col sm:w-3/5 gap-3 ">
          <h4>Kalkylera priset för din förening</h4>
          <p>
            Välj antal platser och faktureringsperiod för att se vad det skulle
            kosta din förening. Du kan ändra detta även efter registrering.
          </p>
        </div>
        <div className="flex flex-col justify-around items-end md:w-2/5  ">
          <p className="flex flex-col items-end">
            {priceToDisplay ? (
              <>
                <span className="text-4xl font-semibold">
                  {priceToDisplay.toLocaleString("sv-SE") + "kr"}
                </span>
                <span className="text-red-700 text-2xl font-medium mb-6 md:m-0">
                  /månad
                </span>
              </>
            ) : (
              <span className="text-4xl text-red-700 font-semibold">
                Kunde inte hämta priser
              </span>
            )}
          </p>
          <div className="flex flex-col gap-1">
            <Select
              aria-label="Välj antal platser"
              placeholder="Välj antal platser"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];

                setSeats(parseInt(String(selected), 10));
              }}
            >
              <SelectItem key={"25"}>25</SelectItem>
              <SelectItem key={"50"}>50</SelectItem>
              <SelectItem key={"75"}>75</SelectItem>
              <SelectItem key={"100"}>100</SelectItem>
              <SelectItem key={"125"}>125</SelectItem>
              <SelectItem key={"150"}>150</SelectItem>
              <SelectItem key={"175"}>175</SelectItem>
            </Select>
            <Tabs
              aria-label="Tabs variants"
              variant="light"
              size="lg"
              selectedKey={period}
              onSelectionChange={(key) => setPeriod(key.toString())}
            >
              <Tab
                key="monthly"
                className="p-0"
                title={
                  <div className="flex h-9 w-full rounded-xl border-medium border-white items-center px-3 text-black">
                    Månadsvis
                  </div>
                }
              />

              <Tab
                key="yearly"
                className="p-0"
                title={
                  <div className="flex h-9 w-full rounded-xl  border-medium border-white items-center px-5 text-black">
                    Årsvis
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
