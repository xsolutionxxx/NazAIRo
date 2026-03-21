import { Container } from "@shared/ui/container";

interface SearchPageTemplateProps {
  searchForm?: React.ReactNode;
  filters?: React.ReactNode;
  sort?: React.ReactNode;
  result?: React.ReactNode;
}

export default function SearchPageTemplate({
  searchForm,
  filters,
  sort,
  result,
}: SearchPageTemplateProps) {
  return (
    <Container className="pt-12 pb-30">
      <section className="mb-8">{searchForm}</section>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-4">
          <h3 className="mb-8">Filters</h3>
          {filters}
        </aside>

        <main className="col-span-8">
          <section className="mb-8">{sort}</section>

          <section>{result}</section>
        </main>
      </div>
    </Container>
  );
}
