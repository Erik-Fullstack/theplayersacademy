import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "@/config/api";
import Section from "@/components/layout/Section";
import OnboardingStepCard from "@/app/public/Onboarding/OnboardingStepCard";
import step1Img from "@/assets/images/b7844008dff4336d827525396bdcede14b55e3b1.png";
import step2Img from "@/assets/images/25e36d241dafae250dc98775f16dce0a3dba9037.png";
import step3Img from "@/assets/images/f14b8472a6fbc8404820219d9886366ebccd4462.png";
import step4Img from "@/assets/images/d6a32ffa54da0b1f2566413c9f04e28836ee2b17.png";
import step5Img from "@/assets/images/e522f510aa28bc374bcdc680ff527d7a361dc62a.png";

const onboardingSteps = [
  {
    step: 1,
    img: step1Img,
    info: "Fyll i grundläggande uppgifter om föreningen",
  },
  {
    step: 2,
    img: step2Img,
    info: "Välj abonnemang utifrån hur många tränare ni vill bjuda in",
  },
  {
    step: 3,
    img: step3Img,
    info: "Få en anpassad utbildningsplan baserad på era behov och mål",
  },
  {
    step: 4,
    img: step4Img,
    info: "Bjud in tränare till plattformen",
  },
  {
    step: 5,
    img: step5Img,
    info: "Tränarna loggar in i Learnifier och börjar sin utbildning",
  },
];

export default function Page() {
  return (
    <>
      <Section>
        <h1 className="text-branding1">Kom igång</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-[4rem]">
          <div className="flex flex-col flex-1 gap-4">
            <p className="text-xl font-semibold">
              Första gången här? Inga problem!{" "}
              <br className="hidden sm:block" /> Följ stegen nedan för att
              registrera din förening <br className="hidden sm:block" /> och
              komma igång med utbildningen.
            </p>
            <p>
              Registrera din förening{" "}
              <a
                href={`${API_BASE_URL}/auth/google`}
                className="text-branding3 font-semibold underline"
              >
                HÄR
              </a>{" "}
              eller skicka en{" "}
              <Link to="/contact" className="link">
                intresseanmälan
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col items-left sm:items-center">
            <p className=" font-medium italic">Vill du komma igång direkt?</p>
            <Button
              className="mt-2 bg-branding3 text-white font-semibold text-xs w-fit"
              href={`${API_BASE_URL}/auth/google`}
              as="a"
            >
              Registrera din förening här
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-branding3 mt-6 mb-6">
          Framgång börjar med rätt utbildning <br className="sm:hidden" /> – för
          både ledare och lag.
        </h2>

        <div className="flex flex-col  gap-4 sm:gap-0">
          {onboardingSteps.map((step) => (
            <OnboardingStepCard
              key={step.step}
              step={step.step}
              stepInfo={step.info}
              stepImg={step.img}
            />
          ))}
        </div>

        <div className="bg-branding5 rounded-medium p-6 my-16 shadow-md shadow-stone-300 text-center border-small border-branding3">
          <h3 className="text-2xl font-bold text-branding3 mb-2">
            Gör som andra föreningar <br className="sm:hidden" /> – kom igång
            idag!
          </h3>
          <p className="mb-4 text-base sm:text-lg">
            Registrera din förening och få tillgång till färdiga
            tränarutbildningar anpassade för svensk fotboll. Enkelt att komma
            igång – direkt stöd och uppföljning ingår.
          </p>
          <Button
            className="bg-branding3 text-white font-semibold px-6 py-3 text-sm sm:text-base rounded-lg shadow-md hover:brightness-110 transition"
            href={`${API_BASE_URL}/auth/google`}
            as="a"
          >
            Registrera din förening nu
          </Button>
        </div>
        <div>
          <h2 className="text-xl mb-2">Frågor eller funderingar?</h2>
          <p>
            Kolla in våra{" "}
            <Link to="/faq" className="link">
              frågor och svar
            </Link>{" "}
            eller skicka ett meddelande{" "}
            <Link to="/contact" className="link">
              här
            </Link>{" "}
            så hör vi av oss med mer information!
          </p>
        </div>
      </Section>
    </>
  );
}
