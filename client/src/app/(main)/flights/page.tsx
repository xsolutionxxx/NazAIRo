import { Suspense } from "react";
import FlightSearchForm from "@widgets/flight-search-form/FlightSearchForm";
import FlightFilters from "@widgets/flight-filters/FlightFilters";
import FlightList from "@widgets/flight-list/FlightList";
import FlightsTabsList from "@features/flights/FlightsTabsList";
import SearchPageTemplate from "@shared/ui/SearchPageTemplate";

export default function Flights() {
  return (
    <Suspense>
      <SearchPageTemplate
        searchForm={<FlightSearchForm />}
        filters={<FlightFilters />}
        sort={<FlightsTabsList />}
        result={<FlightList />}
      />
    </Suspense>
  );
}
