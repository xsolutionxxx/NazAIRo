import { Suspense } from "react";
import HotelSearchForm from "@widgets/hotel-search-form/HotelSearchForm";
import HotelFilters from "@widgets/hotel-filters/HotelFilters";
import HotelList from "@widgets/hotel-list/HotelList";
import SearchPageTemplate from "@shared/ui/SearchPageTemplate";

export default function Stays() {
  return (
    <Suspense>
      <SearchPageTemplate
        searchForm={<HotelSearchForm />}
        filters={<HotelFilters />}
        result={<HotelList />}
      />
    </Suspense>
  );
}
