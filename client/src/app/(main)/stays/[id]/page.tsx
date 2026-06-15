import { Suspense } from "react";
import HotelDetailPage from "@widgets/hotel-detail/HotelDetailPage";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>;
}

export default async function HotelDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { checkIn, checkOut, guests } = await searchParams;
  return (
    <Suspense>
      <HotelDetailPage
        hotelId={id}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={Number(guests ?? 1)}
      />
    </Suspense>
  );
}
