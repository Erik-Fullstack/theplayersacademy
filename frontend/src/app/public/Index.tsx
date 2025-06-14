import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useApi } from "@/services/useApi";
import { siteConfig } from "@/config/site";
import useConfigStore from "@/store/useConfigStore";
import Hero from "@/components/layout/Hero";
import Section from "@/components/layout/Section";
import FeatureCard from "@/components/common/Cards/FeatureCard";
import FeatureCardGroup from "@/components/common/Cards/FeatureCardGroup";
import Logo from "@/assets/logo_01.svg";
import heroImage from "@/assets/images/fotball.jpg";
import heroImage2 from "@/assets/images/team.jpg";
import backendHelper from "@/utils/backendConfigHelper";

export default function IndexPage() {
  const { config, setConfig } = useConfigStore();
  const api = useApi();

  const { data: pagesConfig, isLoading } = api.pages.useConfig();

  useEffect(() => {
    if (pagesConfig) {
      setConfig(pagesConfig);
    }
  }, [pagesConfig, setConfig]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          Laddar innehåll...
        </div>
      ) : (
        <>
          <Hero dark top className="bg-branding1 text-shadow-lg/50">
            <Section
              classes={{ innerContainer: "flex flex-col text-center p-2" }}
              maxWidth="3xl"
            >
              <img
                src={Logo}
                alt="Logga"
                className="w-full max-w-[100px] mx-auto mb-4"
              />
              <h1 className="title text-white text-5xl">
                {config
                  ? backendHelper(config.landingpage.sections, "hero")?.title
                  : siteConfig.name}
              </h1>
              <p className="text-xl">
                {config
                  ? backendHelper(config.landingpage.sections, "hero")?.text
                  : "Strukturerad spelarutveckling för föreningar med ambition"}
              </p>
            </Section>
          </Hero>
          <Section maxWidth="4xl">
            <p className="text-center font-medium text-lg">
              Vi stöttar föreningar i att planera, genomföra och följa upp en
              långsiktig utbildning för sina spelare. Vi skapar en röd tråd i
              spelarutvecklingen genom:
            </p>
            <FeatureCardGroup className="flex flex-col">
              <FeatureCard
                className="shadow-md shadow-stone-300 text-branding3 border-small border-branding3 bg-branding5 w-72 sm:w-80 md:w-full justify-self-center"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard1")
                        ?.title
                    : "STRUKTURERADE TRÄNINGSPROGRAM"
                }
                icon="carbon:soccer"
              />
              <FeatureCard
                className="shadow-md shadow-stone-300 text-branding3 border-small border-branding3 bg-branding5 w-72 sm:w-80 md:w-full  justify-self-center"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard2")
                        ?.title
                    : "TYDLIGA STEG"
                }
                icon="fluent:text-word-count-20-regular"
              />
              <FeatureCard
                className="shadow-md shadow-stone-300 text-branding3 border-small border-branding3 bg-branding5 w-72 sm:w-80 md:w-full justify-self-center"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard3")
                        ?.title
                    : "INDIVIDUELLA UTVECKLINGSMÅL"
                }
                icon="game-icons:goal-keeper"
              />
            </FeatureCardGroup>
          </Section>
          <Hero light bgImg={heroImage}>
            <div className="w-full m-[6rem] mx-auto max-w-4xl h-full flex justify-end items-center">
              <div className="max-w-md p-4 mx-6 bg-white rounded-md border border-gray-800 shadow-md md:p-8">
                <div className="text-3xl font-medium md:text-3xl font-heading">
                  Bygg
                  <span className="text-branding3">
                    {" "}
                    framtidens fotbollsspelare{" "}
                  </span>
                  med en tydlig{" "}
                  <span className="font-semibold">utvecklingplan</span>
                </div>
                <Button
                  as={Link}
                  to="/onboarding"
                  className="bg-branding3 text-white mt-4"
                >
                  Kom igång
                </Button>
              </div>
            </div>
          </Hero>
          <Section classes={{ innerContainer: "mt-14 mb-14" }} maxWidth="5xl">
            <div className="flex gap-8 flex-col md:flex-row md:gap-20 text-center sm:text-left">
              <div className="flex flex-col">
                <div className="flex flex-col gap-4">
                  <h2 className="text-branding1 text-4xl">
                    Vårt mål med spelarutbildningen
                  </h2>
                  <p className="font-medium">
                    Vi vill inspirera så många barn och unga som möjligt att
                    spela fotboll länge – och ge dem chansen att nå sin fulla
                    potential.
                  </p>

                  <Button
                    as={Link}
                    to="/spelarutbildningsplan"
                    className="bg-branding2"
                  >
                    Läs mer om tanken bakom allt
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <Icon
                      className="text-branding3 text-3xl"
                      icon="octicon:goal-24"
                    />
                    <h3 className="text-3xl mb-2">Spelaren i centrum</h3>
                  </div>
                  <p>
                    Vår vision är att utbilda starka och intelligenta
                    fotbollsspelare med en god teknisk plattform som är redo för
                    en elitsatsning eller seniorspel.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <Icon
                      className="text-branding3 text-3xl"
                      icon="ion:binoculars-outline"
                    />
                    <h3 className="text-3xl mt-5 mb-2">
                      En helhetssyn på spelarutbildning
                    </h3>
                  </div>

                  <p>
                    Vi bygger vår spelarutbildning på vetenskaplig forskning
                    genom att skapa en utvecklingsmiljö där fysisk, teknisk och
                    mental träning är anpassad efter spelarnas ålder och behov.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section
            classes={{ innerContainer: "px-0 py-0" }}
            className="bg-branding5"
            maxWidth="5xl"
          >
            <FeatureCardGroup>
              <FeatureCard
                className="text-branding3"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard4")
                        ?.title
                    : "Enkel utvecklingsväg"
                }
                icon="hugeicons:chart-up"
                textContent={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard4")
                        ?.text
                    : "En tydlig väg för spelare att utvecklas genom strukturerade träningsprogram och individuella mål."
                }
              />
              <FeatureCard
                className="text-branding3"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard5")
                        ?.title
                    : "Inspirerande utmaningar"
                }
                icon="game-icons:stairs-goal"
                textContent={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard5")
                        ?.text
                    : "Vi erbjuder spelarna uztmanande och roliga träningsmoment som främjar kontinuerlig utveckling."
                }
              />
              <FeatureCard
                className="text-branding3"
                title={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard6")
                        ?.title
                    : "Vetenskaplig grund"
                }
                icon="la:chalkboard-teacher"
                textContent={
                  config
                    ? backendHelper(config.landingpage.sections, "featureCard6")
                        ?.text
                    : "Genom SvFF:s och UEFA:s metoder säkerställer vi långsiktig och rätt utveckling för både spelare och tränare."
                }
              />
            </FeatureCardGroup>
          </Section>
          <Hero
            dark
            overlay="bg-branding3/60"
            minHeight="sm"
            bgImg={heroImage2}
          >
            <Section
              classes={{
                innerContainer: "flex flex-col items-center text-center",
              }}
            >
              <div>
                <h2 className="text-4xl">Från bollkul till seniorfotboll</h2>
                <p>Läs mer om hur vi skapar en röd tråd i spelarutveckling</p>

                <Button
                  as={Link}
                  to="/spelarutbildningsplan"
                  className="bg-branding2 mt-4"
                >
                  Läs mer här
                </Button>
              </div>
            </Section>
          </Hero>
        </>
      )}
    </>
  );
}
