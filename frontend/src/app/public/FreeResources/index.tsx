import Section from "@/components/layout/Section";
import FreeMaterialCard from "@/app/public/FreeResources/FreeResourcesCard";
import { useApi } from "@/services/useApi";

export default function Page() {
  const api = useApi();

  const {
    data: docResponse,
    isLoading,
    isError,
    error,
  } = api.documents.useList();

  if (isLoading) return <Section>Laddar dokument...</Section>;
  if (isError) return <Section>Fel: {error.message}</Section>;

  const document = (docResponse?.data || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );

  const isEmpty = document.length === 0;

  return (
    <>
      <Section maxWidth="3xl">
        <h1 className="text-branding1">Gratis material</h1>
        <p>
          Här kan du ta del av kostnadsfritt material att ladda ned – perfekt
          för träning, inspiration eller användning i din förening.
        </p>
      </Section>
      {isEmpty ? (
        <Section>
          <p className="italic text-center text-gray-700">
            Inga gratismaterial tillgängliga
          </p>
        </Section>
      ) : (
        <Section className="bg-branding3 flex flex-col gap-4 min-h-96 ">
          <ul className="flex flex-col gap-5">
            {document.map((doc) => (
              <li key={doc.id}>
                <FreeMaterialCard
                  title={doc.title}
                  description={doc.description}
                  imgURL={doc.imgURL}
                  fileURL={doc.fileURL}
                  id={doc.id}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
