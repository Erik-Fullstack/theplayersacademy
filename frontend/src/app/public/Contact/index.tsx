import Section from "@/components/layout/Section";
import ContactForm from "@/app/public/Contact/ContactForm";

export default function Page() {
  return (
    <Section className="bg-branding3 p-4">
      <h1 className="text-white mb-3">Skicka intresseanmälan</h1>
      <ContactForm />
    </Section>
  );
}
