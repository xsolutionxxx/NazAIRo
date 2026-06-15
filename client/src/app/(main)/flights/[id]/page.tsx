import { Suspense } from "react";
import FlightBookingPage from "@widgets/flight-booking/FlightBookingPage";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ passengers?: string }>;
}

export default async function FlightBooking({ params, searchParams }: Props) {
  const { id } = await params;
  const { passengers } = await searchParams;

  return (
    <Suspense>
      <FlightBookingPage
        flightId={id}
        passengersCount={Number(passengers ?? 1)}
      />
    </Suspense>
  );
}
