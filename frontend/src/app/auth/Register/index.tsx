import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { FaCalculator } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";

import Section from "@/components/layout/Section";
import PriceCalculatorCard from "@/components/common/PriceCalculatorCard";
import RegisterForm from "@/app/auth/Register/RegisterForm";

export default function Page() {
  return (
    <>
      <Link to="/">
        <Button color="primary" className="bg-branding3 m-6">
          &larr; Tillbaka till startsidan
        </Button>
      </Link>
      <Section>
        <h1 className="text-branding1">Registrera din förening</h1>
        <p className="text-lg mb-10">
          Starta registreringen genom att fylla i formuläret nedan eller skicka
          en intresseanmälan{" "}
          <Link
            to="/onboarding"
            className="text-branding3 font-semibold underline"
          >
            HÄR
          </Link>{" "}
          vid frågor och funderingar
        </p>

        <div className="flex flex-row items-center gap-3 mb-3">
          <FaCalculator className="text-branding3 w-5 h-5" />
          <h3 className="text-2xl text-branding3">
            Beräkna kostnaden för din förening
          </h3>
        </div>

        <PriceCalculatorCard />
      </Section>
      <Section className="bg-branding3 p-6">
        <div className="flex flex-row items-center gap-3 mb-3">
          <FaPencilAlt className="text-white w-5 h-5" />
          <h3 className="text-2xl text-white">Registrera din förening här</h3>
        </div>
        <RegisterForm />
      </Section>
    </>
  );
}
