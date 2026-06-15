"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Star, MapPin, Wifi, Dumbbell, UtensilsCrossed, Waves, Check } from "lucide-react";
import { hotelApi, hotelBookingApi } from "@features/hotels/api/hotelApi";
import { bookingApi } from "@features/flights/api/bookingApi";
import type { IHotelDetail, IRoom } from "@entities/hotel/types/IHotel";
import { Container } from "@shared/ui/container";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import PassengersForm from "@widgets/flight-booking/PassengersForm";
import CheckoutForm from "@widgets/flight-booking/CheckoutForm";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

type Step = "rooms" | "guests" | "payment" | "confirmation";

interface Props { hotelId: string; checkIn?: string; checkOut?: string; guests: number; }

export default function HotelDetailPage({ hotelId, checkIn, checkOut, guests }: Props) {
  const [hotel, setHotel] = useState<IHotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("rooms");
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    hotelApi.getById(hotelId, { checkIn, checkOut, guests })
      .then((r) => { setHotel(r.data); setLoading(false); });
  }, [hotelId]);

  const handleSelectRoom = (room: IRoom) => { setSelectedRoom(room); setStep("guests"); };

  const handleGuestsSubmit = async (guestData: any[]) => {
    if (!selectedRoom || !checkIn || !checkOut) return;
    setBookingError(null);
    try {
      const res = await hotelBookingApi.initiateHotelBooking({
        roomId: selectedRoom.id,
        checkIn, checkOut,
        guestCount: guests,
        guests: guestData,
      });
      setClientSecret(res.data.clientSecret);
      setBookingId(res.data.bookingId);
      setTotalPrice(res.data.totalPrice);
      setStep("payment");
    } catch (e: any) {
      setBookingError(e.response?.data?.message ?? "Booking failed");
    }
  };

  const handlePaymentSuccess = async () => {
    await bookingApi.confirmBooking(bookingId);
    setStep("confirmation");
  };

  if (loading) return <Container className="pt-12 pb-30"><div className="h-96 bg-surface rounded-2xl animate-pulse" /></Container>;
  if (!hotel)  return <Container className="pt-12 pb-30 text-center"><p>Hotel not found.</p></Container>;

  const nights = hotel.nights ?? 1;

  return (
    <Container className="pt-12 pb-30">
      {/* Hero images */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-8 h-72">
        {hotel.imageUrls.slice(0, 3).map((url, i) => (
          <div key={i} className={cn("relative bg-background", i === 0 && "col-span-2")}>
            <Image src={url} alt={hotel.name} fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>

      {/* Hotel header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <p className="flex items-center gap-1 text-foreground-muted mt-1">
              <MapPin size={14} strokeWidth={1.5} />{hotel.address}, {hotel.city}, {hotel.country}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Star size={16} className="text-primary fill-primary" />
              <span className="text-2xl font-bold text-primary">{Number(hotel.rating).toFixed(1)}</span>
            </div>
            <p className="text-xs text-foreground-muted">Guest rating</p>
          </div>
        </div>

        {hotel.description && <p className="mt-4 text-foreground-muted">{hotel.description}</p>}

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-4">
          {hotel.amenities.map((a) => (
            <span key={a} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-muted text-foreground">
              <Check size={11} strokeWidth={2.5} />
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      {step === "rooms" && (
        <RoomsSection
          rooms={hotel.rooms}
          nights={nights}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelect={handleSelectRoom}
        />
      )}

      {step === "guests" && selectedRoom && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <PassengersForm count={guests} onSubmit={handleGuestsSubmit} />
            {bookingError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                {bookingError}
              </div>
            )}
          </div>
          <div className="col-span-12 lg:col-span-5">
            <RoomSummaryCard room={selectedRoom} nights={nights} checkIn={checkIn} checkOut={checkOut} guests={guests} />
          </div>
        </div>
      )}

      {step === "payment" && clientSecret && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <CheckoutForm totalPrice={totalPrice} onSuccess={handlePaymentSuccess} onBack={() => setStep("guests")} />
            </Elements>
          </div>
          <div className="col-span-12 lg:col-span-5">
            {selectedRoom && <RoomSummaryCard room={selectedRoom} nights={nights} checkIn={checkIn} checkOut={checkOut} guests={guests} totalPrice={totalPrice} />}
          </div>
        </div>
      )}

      {step === "confirmation" && (
        <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">🏨</span>
          </div>
          <h2 className="text-2xl font-bold">Booking confirmed!</h2>
          <p className="text-foreground-muted">Your stay at <strong>{hotel.name}</strong> is confirmed.</p>
          <p className="text-sm font-mono bg-background rounded-lg px-4 py-2 inline-block">Booking ID: {bookingId}</p>
          <div className="flex gap-3 justify-center pt-4">
            <a href="/account/history" className="px-6 py-2.5 bg-primary text-foreground-static rounded-lg text-sm font-medium hover:bg-[#9BE0C8] transition-all">
              View my bookings
            </a>
            <a href="/stays" className="px-6 py-2.5 border border-[#D7E2EE] rounded-lg text-sm font-medium hover:border-primary transition-all">
              Search more hotels
            </a>
          </div>
        </div>
      )}
    </Container>
  );
}

function RoomsSection({ rooms, nights, checkIn, checkOut, onSelect }: { rooms: IRoom[]; nights: number; checkIn?: string; checkOut?: string; onSelect: (r: IRoom) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available rooms</h2>
      {checkIn && checkOut && (
        <p className="text-sm text-foreground-muted mb-6">
          {new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} →{" "}
          {new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {nights} night{nights !== 1 ? "s" : ""}
        </p>
      )}
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className={cn("bg-surface rounded-2xl border border-[#D7E2EE] p-5 flex items-center gap-5", !room.isAvailableForDates && "opacity-60")}>
            {room.imageUrls?.[0] && (
              <div className="relative h-24 w-32 shrink-0 rounded-xl overflow-hidden bg-background">
                <Image src={room.imageUrls[0]} alt={room.type} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{room.type}</h3>
                <span className="text-xs text-foreground-muted">· Room {room.roomNumber}</span>
              </div>
              {room.description && <p className="text-sm text-foreground-muted mb-2 line-clamp-1">{room.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-[#D7E2EE] text-foreground-muted">{a}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold">${room.pricePerNight}<span className="text-sm font-normal text-foreground-muted">/night</span></p>
              {nights > 1 && <p className="text-xs text-foreground-muted">${room.pricePerNight * nights} total</p>}
              <p className="text-xs text-foreground-muted mb-3">Up to {room.capacity} guests</p>
              {room.isAvailableForDates !== false ? (
                <AppButton onClick={() => onSelect(room)} className="px-5 py-2 rounded-xl text-sm">Book</AppButton>
              ) : (
                <span className="text-xs text-accent font-medium">Not available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomSummaryCard({ room, nights, checkIn, checkOut, guests, totalPrice }: { room: IRoom; nights: number; checkIn?: string; checkOut?: string; guests: number; totalPrice?: number }) {
  const total = totalPrice ?? room.pricePerNight * nights;
  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6 sticky top-6 space-y-4">
      <h3 className="font-bold">Booking summary</h3>
      {room.imageUrls?.[0] && (
        <div className="relative h-36 rounded-xl overflow-hidden bg-background">
          <Image src={room.imageUrls[0]} alt={room.type} fill className="object-cover" unoptimized />
        </div>
      )}
      <div>
        <p className="font-semibold">{room.type}</p>
        <p className="text-sm text-foreground-muted">Room {room.roomNumber}</p>
      </div>
      <div className="bg-background rounded-xl p-4 space-y-2 text-sm">
        {checkIn  && <div className="flex justify-between"><span className="text-foreground-muted">Check-in</span><span className="font-medium">{new Date(checkIn).toLocaleDateString("en-GB",  { day: "numeric", month: "short", year: "numeric" })}</span></div>}
        {checkOut && <div className="flex justify-between"><span className="text-foreground-muted">Check-out</span><span className="font-medium">{new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>}
        <div className="flex justify-between"><span className="text-foreground-muted">Guests</span><span className="font-medium">{guests}</span></div>
        <div className="flex justify-between"><span className="text-foreground-muted">Duration</span><span className="font-medium">{nights} night{nights !== 1 ? "s" : ""}</span></div>
      </div>
      <div className="border-t border-[#D7E2EE] pt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-foreground-muted">${room.pricePerNight} × {nights} nights</span><span>${room.pricePerNight * nights}</span></div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-[#D7E2EE]">
          <span>Total</span><span className="text-primary">${total}</span>
        </div>
      </div>
    </div>
  );
}
