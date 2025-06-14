import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";

import Section from "@/components/layout/Section";
import Hero from "@/components/layout/Hero";
import FeatureCardGroup from "@/components/common/Cards/FeatureCardGroup";
import FeatureCard from "@/components/common/Cards/FeatureCard";
import firstSectionImage from "@/assets/images/team.jpg";
import svffImage from "@/assets/images/SVFF.png";
import uefaImage from "@/assets/images/UEFA.png";
import thirdSectionImage from "@/assets/images/players_player.png";
import fourthSectionImage from "@/assets/images/emilio-garcia-AWdCgDDedH0-unsplash.jpg";

export default function Page() {
  return (
    <>
      <Section classes={{ innerContainer: "" }} maxWidth="5xl">
        <h1 className="text-branding1">Vår Spelarutbildningsplan</h1>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col">
            <h3 className="text-branding3 mt-10">Vår filosofi</h3>
            <div className="flex flex-col gap-10">
              <p>
                Vi hjälper föreningar att ge barn och ungdomar den
                fotbollsutbildning de efterfrågar – mer fotboll, fler utmaningar
                och en tydlig utvecklingsväg.
              </p>
              <p>
                Förutom att utveckla spelarna höjer vi även lägstanivån på
                föreningens tränare. Vi säkerställer att alla tränare följer en
                tydlig plan där utbildningsnivån ökar inkrementellt varje år –
                oavsett vem som står på sidlinjen. Detta ger föreningen en
                hållbar modell för spelarutveckling och garanterar att varje
                generation av spelare får rätt utmaningar vid rätt tidpunkt.
              </p>
              <p>
                Med en metodik baserad på SvFF:s och UEFA:s utbildningsmodeller
                tar vi teorin in i praktiken och skapar en utvecklingsmiljö där
                spelarna kan växa tekniskt, taktiskt och mentalt över tid.
              </p>
              <div className="flex justify-around items-center">
                <img className="w-12" src={svffImage} alt="svff logo" />
                <img className="w-16" src={uefaImage} alt="uefa logo" />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <img className="rounded-lg" src={firstSectionImage} alt="team" />
          </div>
        </div>
      </Section>
      <Section
        classes={{ innerContainer: "flex flex-col" }}
        className="bg-branding5"
        maxWidth="5xl"
      >
        <div className="flex flex-col">
          <h2 className="text-3xl text-branding3 text-center">
            En utbildningsstege från 3 mot 3 till 11 mot 11{" "}
          </h2>
          <div className="flex flex-col gap-10 sm:flex-row">
            <div className="flex flex-col gap-6">
              <div className="text-4xl mt-6">
                <Icon
                  className="place-self-center"
                  icon="game-icons:stairs-goal"
                />
              </div>
              <p>
                Vår utbildning följer spelarnas naturliga utveckling genom de
                olika spelformerna – från 5 mot 5 i unga år till 11 mot 11 innan
                seniorspel.
              </p>
              <p>
                För varje år ökar vi gradvis svårighetsgraden inom teknik, fysik
                och spelförståelse, samtidigt som vi ser till att varje spelare
                får rätt utmaningar vid rätt tidpunkt.
              </p>
              <p>
                Vi arbetar alltid med en långsiktig plan för spelarens
                utveckling som atlet, där vi säkerställer att både
                fotbollsmässiga och fysiska färdigheter byggs upp steg för steg.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="mt-6">
                <h3 className="text-3xl text-branding3">Målet?</h3>
              </div>
              <p className="text-xl font-bold">
                Spelare som är redo för seniorspel eller en elitsatsning
              </p>
              <p>
                Genom vår metodik får föreningens spelare en stabil grund att
                stå på – oavsett om de vill ta klivet upp i seniorlaget eller
                satsa på en elitkarriär.
              </p>
              <p>
                Med en tydlig plan, strukturerad uppföljning och kunniga tränare
                hjälper vi föreningar att skapa framtidens fotbollsspelare.
              </p>
            </div>
          </div>
        </div>
      </Section>
      <Section maxWidth="4xl">
        <div>
          <h3 className="text-branding1 mb-2">Spelaren i centrum</h3>
          <p className="mb-6 font-medium">
            Spelaren står i centrum för samtliga utbildningssteg och alla
            spelformer.
          </p>
          <div className="flex flex-col md:flex-row md:gap-12 rounded-lg p-8 border-small border-branding2 shadow-md shadow-stone-400 ">
            <div className="flex flex-col gap-5">
              <p>
                Första åren är helt fokuserade på att bygga en stark{" "}
                <span className="text-branding1 font-semibold">
                  teknisk plattform
                </span>{" "}
                som ligger till grund för all fotboll.
              </p>
              <p>
                Utan en god
                <span className="text-branding1 font-semibold">
                  {" "}
                  fotbollsfysik{" "}
                </span>
                klarar inte spelaren av att spela 95 minuter med fullt fokus och
                god teknik.{" "}
              </p>
              <p>
                Intelligenta spelare som
                <span className="text-branding1 font-semibold">
                  {" "}
                  förstår spelet{" "}
                </span>
                och kan ta egna beslut utifrån en kommunicerad spelplan.
              </p>
              <p>
                Sista delen är
                <span className="text-branding1 font-semibold">
                  {" "}
                  den mentala,{" "}
                </span>
                vi bygger starka spelare som alltid tar nästa aktion med fullt
                fokus
              </p>
            </div>
            <div>
              <img src={thirdSectionImage} alt="fotballplayer" />
            </div>
          </div>
        </div>
      </Section>
      <Section maxWidth="4xl">
        <div className="flex flex-col gap-3">
          <h3 className="text-branding1 mb-2 text-center">
            Från markeringsspel till lagdelar – stegvis utveckling av
            spelförståelse{" "}
          </h3>
          <div className="flex flex-col sm:flex-row sm:gap-10">
            <p className="flex flex-col items-center text-center gap-3 font-medium mb-4 sm:mb-0">
              <Icon className="text-4xl text-branding3" icon="uis:process" />
              För att unga spelare ska gå från markeringsspel i små spelformer
              till att arbeta med lagdelar i större spelformationer krävs en
              metodisk progression.
            </p>
            <p className="flex flex-col items-center text-center gap-3 font-medium">
              <Icon
                className="text-4xl text-branding3"
                icon="fluent:people-team-16-regular"
              />
              Genom denna stegvisa utveckling lär sig spelarna att först hantera
              sin individuella roll, sedan samarbeta i mindre enheter och
              slutligen förstå helheten i ett organiserat lagspel.
            </p>
          </div>
        </div>
      </Section>
      <Section
        classes={{ innerContainer: "px-0 py-0" }}
        className="bg-branding5"
        maxWidth="5xl"
      >
        <div>
          <FeatureCardGroup>
            <FeatureCard
              className="text-branding3"
              title="Små spelformer"
              subtitle="(3v3 – 5v5)"
              icon="ph:soccer-ball-thin"
              textContent="Fokus på en-mot-en-situationer, individuell markering och grundläggande speldjup och spelbredd. "
            />
            <FeatureCard
              className="text-branding3"
              title="Mellanstora spelformer"
              subtitle="(7v7 – 9v9)"
              icon="icon-park-twotone:soccer-one"
              textContent="Introduktion av zonförsvar, understöd och samarbete för att skapa struktur i spelet."
            />
            <FeatureCard
              className="text-branding3"
              title="Större spelformer"
              subtitle="(11v11)"
              icon="game-icons:soccer-kick"
              textContent="Tydliga lagdelar, samverkan mellan försvar, mittfält och anfall samt taktiska principer som press, understöd och spelytor."
            />
          </FeatureCardGroup>
        </div>
      </Section>
      <Section maxWidth="5xl">
        <div className="mb-16 mt-10">
          <h3 className="text-branding1 mb-5 text-center">
            Så levererar vi detta till er förening
          </h3>
          <div className="flex flex-col gap-5 justify-self-center">
            <p className="flex items-center gap-4">
              <Icon icon="simple-line-icons:check" className="text-branding3" />
              En tydlig plan för föreningens barn & ungdomar från 5v5 till
              11v11.
            </p>
            <p className="flex items-center gap-4">
              <Icon icon="simple-line-icons:check" className="text-branding3" />
              Introduktionsutbildning för tränare – en på våren och en på
              hösten.
            </p>
            <p className="flex items-center gap-4">
              <Icon icon="simple-line-icons:check" className="text-branding3" />
              Mallar för säsongsplanering & träningsplanering för att skapa
              struktur
            </p>
          </div>
        </div>
      </Section>
      <Hero
        dark
        bgImg={fourthSectionImage}
        overlay="bg-green-900/60 "
        minHeight="sm"
      >
        <Section maxWidth="4xl">
          <div className="flex flex-col gap-5 text-center">
            <h3>Vill ni skapa en långsiktig, hållbar spelarutbildning?</h3>
            <p>
              Vi har verktygen och erfarenheten för att hjälpa er. Vi ser fram
              emot att diskutera hur vi kan anpassa detta efter just er
              förening. Låt oss ta nästa steg tillsammans!{" "}
            </p>
            <div>
              <Button as={Link} to="/onboarding" className="bg-branding2">
                Kom igång
              </Button>
            </div>
          </div>
        </Section>
      </Hero>
    </>
  );
}
