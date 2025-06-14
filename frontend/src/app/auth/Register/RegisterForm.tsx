import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Input,
  Form,
  Button,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";
import { IRegisterFormInput } from "@/types";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string>("175");
  const { register, handleSubmit, reset, setValue } =
    useForm<IRegisterFormInput>();
  const { user, refreshUser } = useUserStore();

  useEffect(() => {
    setValue("seats", Number(selectedSeats));
  }, [selectedSeats, setValue]);

  const onSubmit: SubmitHandler<IRegisterFormInput> = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/demo`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          seats: Number(data.seats),
          // phone: Number(data.phone),
        }),
      });

      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        reset();
        setError(null);
        await refreshUser();

        // Redirect
        navigate(user?.role === "SUPERADMIN" ? "/superadmin" : "/dashboard");
      } else {
        setError("Registreringen misslyckades. Försök igen.");
      }
    } catch (error) {
      setError(
        "Något gick fel. Kontrollera din internetanslutning och försök igen."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-lg">
            <Spinner size="lg" color="warning" />
            <p className="text-lg font-medium text-gray-700">
              Skapar förening...
            </p>
          </div>
        </div>
      )}

      <div className="p-6 border-small border-branding3 bg-white rounded-medium">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 justify-center mb-10 w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                value={user ? user.firstName : ""}
                label="Förnamn"
                labelPlacement="outside"
                placeholder="Enter your first name"
                type="text"
                isDisabled={true}
              />
              <Input
                value={user ? user.lastName : ""}
                label="Efternamn"
                labelPlacement="outside"
                placeholder="Enter your last name"
                type="text"
                isDisabled={true}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                value={user ? user.email : ""}
                label="Email"
                labelPlacement="outside"
                placeholder="Enter your email"
                type="text"
                isDisabled={true}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                isRequired
                label="Förening"
                labelPlacement="outside"
                placeholder="Enter your association"
                type="text"
                isDisabled={isSubmitting} // Disable during submission
                {...register("association")}
              />
              <Select
                isRequired
                label="Välj antal kursplatser"
                labelPlacement="outside"
                selectedKeys={[selectedSeats]}
                isDisabled={isSubmitting} // Disable during submission
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0].toString();
                  setSelectedSeats(value);
                  setValue("seats", Number(value));
                }}
              >
                {["25", "50", "75", "100", "125", "150", "175"].map((num) => (
                  <SelectItem key={num}>{num}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center w-full">
            {error && (
              <p className="text-red-600 font-medium text-center">{error}</p>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className="w-52 sm:w-72 bg-branding2 font-medium text-md"
            >
              {isSubmitting ? "Skapar förening..." : "Registrera"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
