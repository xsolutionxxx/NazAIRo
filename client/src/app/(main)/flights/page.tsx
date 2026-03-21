import FlightsTabsList from "@features/flights/FlightsTabsList";
import SearchPageTemplate from "@shared/ui/SearchPageTemplate";

export default function Flights() {
  return (
    <SearchPageTemplate
      searchForm={<div>flight search form</div>}
      filters={<div>filters blocks</div>}
      sort={<FlightsTabsList />}
      result={<div>flight list</div>}
    />
  );
}
