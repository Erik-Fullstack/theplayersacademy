import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Textarea,
  addToast,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/config/api";

interface PriceConfig {
  [key: string]: number;
}
export default function EditPrices() {
  const [config, setConfig] = useState<PriceConfig>({});
  const [error, setError] = useState<string | undefined>("");
  const [editPlan, setEditPlan] = useState<string>("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices/config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data, error }: { data: PriceConfig; error?: string } =
        await response.json();

      if (!response.ok) {
        setError(error);

        return;
      }
      setConfig(data);

      return;
    } catch (error) {
      console.error("Error: ", error);
    }
  };
  const updatePlanPrice = async (plan: string, price: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices/${plan}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPrice: Number(price),
        }),
      });

      if (!response.ok) {
        addToast({
          title: "Något gick fel",
          description: `Error: ${error}`,
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill",
        });

        return;
      }
      addToast({
        title: "Sparad",
        description: `${plan} är nu uppdaterad!`,
        color: "success",
        timeout: 5000,
        icon: "mingcute:check-circle-fill",
      });
      setEditPlan("");
      setPrice("");
      fetchPrices();

      return;
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row justify-center">
      {error ? (
        <p>
          Kunde inte ladda priser. <span className="font-bold">Error: </span>
          {error}{" "}
        </p>
      ) : (
        Object.entries(config).map((plan) => (
          <Card key={plan[0]}>
            <CardHeader>
              <p>
                Prisplan: <span className="font-semibold">{plan[0]}</span>
              </p>
            </CardHeader>
            <CardBody className="flex flex-row">
              {editPlan !== plan[0] ? (
                <p>{plan[1]}kr /plats</p>
              ) : (
                <Textarea
                  placeholder={`Skriv in vad du vill ändra ${plan[0]} till.`}
                  value={price}
                  variant="bordered"
                  label="kr per plats"
                  onChange={(e) => setPrice(e.target.value)}
                />
              )}
            </CardBody>
            <CardFooter>
              {editPlan !== plan[0] ? (
                <Button
                  color="primary"
                  size="sm"
                  className="ml-auto"
                  onPress={() => setEditPlan(plan[0])}
                >
                  Ändra
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    color="success"
                    size="sm"
                    onPress={() => updatePlanPrice(plan[0], price)}
                  >
                    Spara
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onPress={() => {
                      setEditPlan("");
                      setPrice("");
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
