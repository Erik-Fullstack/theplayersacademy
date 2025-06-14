import { prisma } from "../lib/prisma";

export const welcomeMessageTemplates = [
  `**Välkommen till {orgName}!**
Vi är glada att ha dig här! Din roll som tränare är ovärderlig för våra spelare och hela föreningen. Genom att ta del av dessa kurser kan du vidareutveckla ditt ledarskap och bidra till ännu starkare laganda. Tveka inte att höra av dig om du har frågor!

📞 Kontakt: {contactName} - {contactEmail}

⚽ Lycka till med din resa som tränare!`,

  `**Din utveckling börjar här!**
Välkommen till {orgName} utbildningsplattform! Vi tror att en bra tränare inte bara skapar skickliga spelare, utan också bygger karaktär och laganda. Vi hoppas att du får ut mycket av kurserna och att du känner dig inspirerad att göra skillnad på planen.

Vid frågor eller funderingar – vi finns här för dig!

📧 [Kontakta oss]()`,

  `**Framgång börjar med kunskap!**

Som tränare spelar du en central roll i våra spelares utveckling. Denna utbildningsplattform är skapad för att ge dig verktygen du behöver för att bli ännu bättre. Ta dig tid att utforska materialet, och tveka inte att höra av dig om du vill diskutera något!

📞 Ansvarig: [Jörgen Svensson]()`,

  `**Tillsammans skapar vi framtidens fotbollsstjärnor!**

Välkommen till {orgName}! Vi värdesätter dig enormt och vet att du gör en positiv skillnad för våra spelare. Denna plattform är till för dig – ett verktyg för att hjälpa dig utvecklas som tränare. Utforska kurserna, inspirera dina spelare och stärk laget!

[Har du frågor? Vi hjälper gärna!]()`,

  `**Välkommen till tränargemenskapen!**

Hos oss på {orgName} tror vi att en bra tränare är hjärtat i varje lag. Genom att ta del av vårt utbildningsmaterial får du nya perspektiv och metoder som kan lyfta både dig och dina spelare. Vi är här för att stötta dig på din resa!

📧 [Kontakta oss när du behöver hjälp]()`
];

export function generateWelcomeMessage(orgName: string): string {
  // Get a random template
  const randomTemplate = welcomeMessageTemplates[Math.floor(Math.random() * welcomeMessageTemplates.length)];
  
  // Replace placeholders with actual values
  return randomTemplate
    .replace(/\{orgName\}/g, orgName);
}
