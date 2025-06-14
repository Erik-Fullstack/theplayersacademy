import { useEffect } from "react";
import { Link } from "@heroui/react";

import { useApi } from "@/services/useApi";
import useConfigStore from "@/store/useConfigStore";
import Accordion from "@/components/common/Accordion";
import Section from "@/components/layout/Section";

export default function Page() {
  const { config, setConfig } = useConfigStore();
  const api = useApi();

  const { data: pagesConfig, isLoading, isError } = api.pages.useConfig();

  useEffect(() => {
    if (pagesConfig) {
      setConfig(pagesConfig);
    }
  }, [pagesConfig, setConfig]);

  return (
    <>
      <Section>
        <h1>Vanliga frågor & svar</h1>
        <p className="font-medium">
          Här hittar du svar på de vanligaste frågorna kring
          spelarutbildningsplanen och våra kurser.
        </p>
      </Section>
      <Section className="bg-branding3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8 text-white">
            Laddar frågor...
          </div>
        ) : isError ? (
          <h2 className="text-white text-center">
            Kunde inte ladda frågor att visa
          </h2>
        ) : config?.faq?.sections ? (
          <Accordion items={config.faq.sections} />
        ) : (
          <h2 className="text-white text-center">
            Kunde inte ladda frågor att visa
          </h2>
        )}
        <div className="mt-10 text-white text-center">
          <p className="text-lg mb-2">Hittar du inte det du söker?</p>
          <p>
            Tveka inte att kontakta oss{" "}
            <Link href="/onboarding" className="link dark">
              HÄR
            </Link>{" "}
            så hjälper vi dig!
          </p>
        </div>
      </Section>
    </>
  );
}
