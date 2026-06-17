"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/lib/hooks/redux";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Star, MapPin, Wifi, Dumbbell, UtensilsCrossed, Waves, Car, Coffee, Sparkles,
  Users, BedDouble, Check, X, ChevronLeft, ChevronRight, Clock, Baby, PawPrint,
  CreditCard, Cigarette,
} from "lucide-react";
import { hotelApi, hotelBookingApi } from "@features/hotels/api/hotelApi";
import { bookingApi } from "@features/flights/api/bookingApi";
import $api from "@shared/api";
import type { SavedPaymentMethod } from "@widgets/flight-booking/CheckoutForm";
import type { IHotelDetail, IRoom, IHotelGuest } from "@entities/hotel/types/IHotel";
import { Container } from "@shared/ui/container";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import HotelGuestForm from "@widgets/hotel-booking/HotelGuestForm";
import CheckoutForm from "@widgets/flight-booking/CheckoutForm";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

type Step = "rooms" | "guests" | "payment" | "confirmation";

// ─── Amenity category map ────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Free WiFi":      <Wifi            size={15} strokeWidth={1.5} />,
  "Pool":            <Waves          size={15} strokeWidth={1.5} />,
  "Gym":             <Dumbbell       size={15} strokeWidth={1.5} />,
  "Restaurant":      <UtensilsCrossed size={15} strokeWidth={1.5} />,
  "Parking":         <Car            size={15} strokeWidth={1.5} />,
  "Breakfast":       <Coffee         size={15} strokeWidth={1.5} />,
  "Spa":             <Sparkles       size={15} strokeWidth={1.5} />,
  "Bar":             <Coffee         size={15} strokeWidth={1.5} />,
  "Room Service":    <UtensilsCrossed size={15} strokeWidth={1.5} />,
  "Airport Transfer":<Car            size={15} strokeWidth={1.5} />,
  "Kids Club":       <Baby           size={15} strokeWidth={1.5} />,
  "Tennis Court":    <Users          size={15} strokeWidth={1.5} />,
  "Business Center": <CreditCard     size={15} strokeWidth={1.5} />,
};

const AMENITY_CATEGORIES: Record<string, string[]> = {
  "Recreation":  ["Pool", "Gym", "Spa", "Tennis Court", "Water Sports", "Kids Club"],
  "Dining":      ["Restaurant", "Bar", "Room Service", "Breakfast"],
  "Services":    ["24h Reception", "Concierge", "Laundry", "Airport Transfer", "Business Center"],
  "Essentials":  ["Free WiFi", "Air Conditioning", "Heating", "TV", "Mini Bar", "Safe", "Parking"],
};

function groupAmenities(amenities: string[]) {
  const grouped: Record<string, string[]> = {};
  const used = new Set<string>();

  for (const [cat, keys] of Object.entries(AMENITY_CATEGORIES)) {
    const matched = amenities.filter((a) => keys.some((k) => a.toLowerCase().includes(k.toLowerCase())));
    if (matched.length) { grouped[cat] = matched; matched.forEach((m) => used.add(m)); }
  }
  const rest = amenities.filter((a) => !used.has(a));
  if (rest.length) grouped["Other"] = rest;
  return grouped;
}

// ─── Rating label ────────────────────────────────────────────────────────────
function ratingLabel(r: number) {
  if (r >= 4.8) return "Exceptional";
  if (r >= 4.5) return "Excellent";
  if (r >= 4.0) return "Very good";
  if (r >= 3.5) return "Good";
  return "Pleasant";
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props { hotelId: string; checkIn?: string; checkOut?: string; guests: number }

// ─── Main component ──────────────────────────────────────────────────────────
export default function HotelDetailPage({ hotelId, checkIn, checkOut, guests }: Props) {
  const [hotel,      setHotel]      = useState<IHotelDetail | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState<Step>("rooms");
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingId,    setBookingId]    = useState("");
  const [totalPrice,   setTotalPrice]   = useState(0);
  const [bookingError,  setBookingError]  = useState<string | null>(null);
  const [savedMethods,  setSavedMethods]  = useState<SavedPaymentMethod[]>([]);

  // Photo gallery
  const { user } = useAppSelector((s) => s.authReducer);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx,  setGalleryIdx]  = useState(0);

  useEffect(() => {
    hotelApi.getById(hotelId, { checkIn, checkOut, guests })
      .then((r) => { setHotel(r.data); setLoading(false); });
    $api.get<SavedPaymentMethod[]>("/payment-methods")
      .then((r) => setSavedMethods(r.data))
      .catch(() => {});
  }, [hotelId]);

  const openGallery = (idx: number) => { setGalleryIdx(idx); setGalleryOpen(true); };
  const galleryPrev = () => setGalleryIdx((i) => (i - 1 + (hotel?.imageUrls.length ?? 1)) % (hotel?.imageUrls.length ?? 1));
  const galleryNext = () => setGalleryIdx((i) => (i + 1) % (hotel?.imageUrls.length ?? 1));

  const handleSelectRoom = (room: IRoom) => { setSelectedRoom(room); setStep("guests"); };

  const handleGuestsSubmit = async (guest: IHotelGuest) => {
    if (!selectedRoom || !checkIn || !checkOut) return;
    setBookingError(null);
    try {
      const res = await hotelBookingApi.initiateHotelBooking({
        roomId: selectedRoom.id,
        checkIn, checkOut,
        guestCount: guests,
        guests: Array.from({ length: guests }, () => ({
          firstName: guest.firstName,
          lastName:  guest.lastName,
        })),
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

  if (loading) return (
    <Container className="pt-12 pb-30">
      <div className="h-80 bg-surface rounded-2xl animate-pulse mb-6" />
      <div className="h-8 bg-surface rounded-xl animate-pulse mb-3 w-1/2" />
      <div className="h-4 bg-surface rounded-xl animate-pulse w-1/3" />
    </Container>
  );
  if (!hotel) return <Container className="pt-12 pb-30 text-center"><p>Hotel not found.</p></Container>;

  const nights = hotel.nights ?? 1;
  const amenityGroups = groupAmenities(hotel.amenities);
  const images = hotel.imageUrls.length ? hotel.imageUrls : [];

  return (
    <Container className="pt-8 pb-30">
      {/* ── Photo gallery grid ─────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className={cn("grid gap-2", images.length === 1 ? "grid-cols-1" : "grid-cols-4", "h-80 sm:h-[420px]")}>
            {/* Main large photo */}
            <button
              onClick={() => openGallery(0)}
              className={cn("relative bg-background overflow-hidden", images.length === 1 ? "col-span-4" : "col-span-2 row-span-2")}
            >
              <Image src={images[0]} alt={hotel.name} fill className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
            </button>
            {/* Side photos */}
            {images.slice(1, 5).map((url, i) => (
              <button key={i} onClick={() => openGallery(i + 1)} className="relative bg-background overflow-hidden hidden sm:block">
                <Image src={url} alt={`${hotel.name} ${i + 2}`} fill className="object-cover hover:brightness-90 transition-all" unoptimized />
                {/* "See all" overlay on last visible */}
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{images.length - 5} photos</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {/* All photos button */}
          <button
            onClick={() => openGallery(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-4 py-2 rounded-xl shadow hover:bg-white transition-all"
          >
            <span>⊞</span> Show all {images.length} photos
          </button>
        </div>
      )}

      {/* ── Hotel header ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Stars */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs text-foreground-muted ml-1">{hotel.stars}-star hotel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{hotel.name}</h1>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(hotel.address + ", " + hotel.city)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-sm text-foreground-muted hover:text-primary transition-colors mt-2"
            >
              <MapPin size={14} strokeWidth={1.5} />
              {hotel.address}, {hotel.city}, {hotel.country}
            </a>
          </div>

          {/* Rating block */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-foreground-static leading-none">
                  {Number(hotel.rating).toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold mt-1">{ratingLabel(hotel.rating)}</p>
            {hotel.reviewCount && (
              <p className="text-xs text-foreground-muted">{hotel.reviewCount.toLocaleString()} reviews</p>
            )}
          </div>
        </div>

        {/* Description */}
        {hotel.description && (
          <p className="mt-5 text-foreground-muted leading-relaxed">{hotel.description}</p>
        )}
      </div>

      {/* Steps */}
      {step === "rooms" && (
        <>
          {/* ── Amenities by category ───────────────────────────────────────── */}
          {hotel.amenities.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-5">Facilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(amenityGroups).map(([cat, items]) => (
                  <div key={cat} className="bg-surface rounded-2xl border border-[#D7E2EE] p-4">
                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">{cat}</h3>
                    <ul className="space-y-2">
                      {items.map((a) => (
                        <li key={a} className="flex items-center gap-2 text-sm">
                          <span className="text-primary shrink-0">
                            {AMENITY_ICONS[a] ?? <Check size={15} strokeWidth={1.5} />}
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Hotel Policies ──────────────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-5">Hotel policies</h2>
            <div className="bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden">
              {[
                { icon: <Clock size={15} strokeWidth={1.5} />, label: "Check-in",     value: "From 14:00 – 22:00" },
                { icon: <Clock size={15} strokeWidth={1.5} />, label: "Check-out",    value: "Until 11:00" },
                { icon: <Baby  size={15} strokeWidth={1.5} />, label: "Children",     value: "Children of all ages welcome" },
                { icon: <PawPrint size={15} strokeWidth={1.5} />, label: "Pets",      value: "Pets are not allowed" },
                { icon: <Cigarette size={15} strokeWidth={1.5} />, label: "Smoking",  value: "Non-smoking rooms only" },
                { icon: <CreditCard size={15} strokeWidth={1.5} />, label: "Payment", value: "Visa, Mastercard, AmEx accepted" },
              ].map(({ icon, label, value }, i, arr) => (
                <div key={label} className={cn("flex items-center gap-4 px-5 py-3.5 text-sm", i !== arr.length - 1 && "border-b border-[#D7E2EE]")}>
                  <span className="text-foreground-muted shrink-0">{icon}</span>
                  <span className="font-medium w-28 shrink-0">{label}</span>
                  <span className="text-foreground-muted">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Available rooms ─────────────────────────────────────────────── */}
          <RoomsSection
            rooms={hotel.rooms}
            nights={nights}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onSelect={handleSelectRoom}
          />
        </>
      )}

      {step === "guests" && selectedRoom && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <HotelGuestForm guestCount={guests} user={user} onSubmit={handleGuestsSubmit} />
            {bookingError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                {bookingError}
              </div>
            )}
          </div>
          <div className="col-span-12 lg:col-span-5">
            <RoomSummaryCard
              room={selectedRoom} nights={nights}
              checkIn={checkIn} checkOut={checkOut} guests={guests}
            />
          </div>
        </div>
      )}

      {step === "payment" && clientSecret && selectedRoom && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <CheckoutForm
                totalPrice={totalPrice}
                clientSecret={clientSecret}
                bookingId={bookingId}
                savedMethods={savedMethods}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep("guests")}
              />
            </Elements>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <RoomSummaryCard
              room={selectedRoom} nights={nights}
              checkIn={checkIn} checkOut={checkOut} guests={guests}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      )}

      {step === "confirmation" && (
        <HotelConfirmationStep bookingId={bookingId} hotelName={hotel.name} />
      )}

      {/* ── Full-screen gallery lightbox ────────────────────────────────────── */}
      {galleryOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <div className="relative w-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
            {/* Counter */}
            <p className="text-white/60 text-sm text-center mb-3">{galleryIdx + 1} / {images.length}</p>

            {/* Main image */}
            <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden">
              <Image src={images[galleryIdx]} alt={hotel.name} fill className="object-contain" unoptimized />
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={galleryPrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={galleryNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Thumbnails */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 justify-center">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={cn(
                    "relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    i === galleryIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </Container>
  );
}

// ─── Rooms section ────────────────────────────────────────────────────────────
function RoomsSection({
  rooms, nights, checkIn, checkOut, guests, onSelect,
}: {
  rooms: IRoom[]; nights: number; checkIn?: string; checkOut?: string; guests: number; onSelect: (r: IRoom) => void;
}) {
  const available = rooms.filter((r) => r.isAvailableForDates !== false);
  const unavailable = rooms.filter((r) => r.isAvailableForDates === false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Available rooms</h2>
        {checkIn && checkOut && (
          <p className="text-sm text-foreground-muted">
            {new Date(checkIn).toLocaleDateString("en-GB",  { day: "numeric", month: "short" })} –{" "}
            {new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {" "}· {nights} night{nights !== 1 ? "s" : ""} · {guests} guest{guests !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {available.map((room) => <RoomCard key={room.id} room={room} nights={nights} onSelect={onSelect} />)}
        {unavailable.map((room) => <RoomCard key={room.id} room={room} nights={nights} onSelect={onSelect} unavailable />)}
      </div>

      {available.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <p className="text-lg font-semibold mb-1">No rooms available</p>
          <p className="text-sm">Try different dates or fewer guests.</p>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, nights, onSelect, unavailable = false }: { room: IRoom; nights: number; onSelect: (r: IRoom) => void; unavailable?: boolean }) {
  const total = room.pricePerNight * nights;
  const taxes = Math.round(total * 0.12);

  return (
    <div className={cn(
      "bg-surface rounded-2xl border border-[#D7E2EE] overflow-hidden transition-shadow",
      !unavailable && "hover:shadow-md",
      unavailable && "opacity-55",
    )}>
      <div className="flex flex-col sm:flex-row">
        {/* Room image */}
        {room.imageUrls?.[0] && (
          <div className="relative sm:w-52 h-44 sm:h-auto shrink-0 bg-background">
            <Image src={room.imageUrls[0]} alt={room.type} fill className="object-cover" unoptimized />
          </div>
        )}

        {/* Room info */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-bold text-base">{room.type}</h3>
              <span className="text-xs text-foreground-muted px-2 py-0.5 bg-background rounded-full border border-[#D7E2EE]">
                Room {room.roomNumber}
              </span>
            </div>

            {/* Capacity */}
            <div className="flex items-center gap-1.5 text-sm text-foreground-muted mb-3">
              <Users size={13} strokeWidth={1.5} />
              Up to {room.capacity} guests
              <BedDouble size={13} strokeWidth={1.5} className="ml-2" />
              {room.type.toLowerCase().includes("suite") ? "King bed" : "Double bed"}
            </div>

            {room.description && (
              <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{room.description}</p>
            )}

            {/* Amenity pills */}
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.slice(0, 5).map((a) => (
                <span key={a} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-background border border-[#D7E2EE] text-foreground-muted">
                  <Check size={10} strokeWidth={2.5} className="text-primary" /> {a}
                </span>
              ))}
              {room.amenities.length > 5 && (
                <span className="text-[11px] px-2 py-1 rounded-full bg-background border border-[#D7E2EE] text-foreground-muted">
                  +{room.amenities.length - 5} more
                </span>
              )}
            </div>

            {/* Cancellation badge */}
            {!unavailable && (
              <p className="text-xs font-medium text-emerald-600 mt-3 flex items-center gap-1">
                <Check size={12} strokeWidth={2.5} /> Free cancellation
              </p>
            )}
          </div>

          {/* Pricing + CTA */}
          <div className="shrink-0 sm:text-right sm:min-w-[160px] flex sm:flex-col justify-between sm:justify-start items-end sm:items-end gap-3">
            <div>
              <p className="text-2xl font-bold">${room.pricePerNight}<span className="text-sm font-normal text-foreground-muted">/night</span></p>
              {nights > 1 && (
                <>
                  <p className="text-sm text-foreground-muted">${total} · {nights} nights</p>
                  <p className="text-xs text-foreground-muted">+${taxes} taxes & fees</p>
                </>
              )}
            </div>
            {unavailable ? (
              <span className="text-sm text-accent font-medium">Not available</span>
            ) : (
              <AppButton onClick={() => onSelect(room)} className="px-6 py-2.5 rounded-xl text-sm whitespace-nowrap">
                Reserve
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Room summary card ────────────────────────────────────────────────────────
function RoomSummaryCard({
  room, nights, checkIn, checkOut, guests, totalPrice,
}: {
  room: IRoom; nights: number; checkIn?: string; checkOut?: string; guests: number; totalPrice?: number;
}) {
  const roomRate  = room.pricePerNight * nights;
  const taxes     = Math.round(roomRate * 0.12);
  const cleanFee  = 25;
  const total     = totalPrice ?? (roomRate + taxes + cleanFee);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 sticky top-6 space-y-4">
      <h3 className="font-bold">Booking summary</h3>

      {/* Room image */}
      {room.imageUrls?.[0] && (
        <div className="relative h-36 rounded-xl overflow-hidden bg-background">
          <Image src={room.imageUrls[0]} alt={room.type} fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Room name */}
      <div>
        <p className="font-semibold">{room.type}</p>
        <p className="text-sm text-foreground-muted">Room {room.roomNumber}</p>
      </div>

      {/* Dates & guests */}
      <div className="bg-background rounded-xl p-4 space-y-2.5 text-sm">
        {checkIn  && <div className="flex justify-between"><span className="text-foreground-muted">Check-in</span><span className="font-medium">{fmt(checkIn)}</span></div>}
        {checkOut && <div className="flex justify-between"><span className="text-foreground-muted">Check-out</span><span className="font-medium">{fmt(checkOut)}</span></div>}
        <div className="flex justify-between"><span className="text-foreground-muted">Guests</span><span className="font-medium">{guests}</span></div>
        <div className="flex justify-between"><span className="text-foreground-muted">Duration</span><span className="font-medium">{nights} night{nights !== 1 ? "s" : ""}</span></div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 text-sm pt-1">
        <div className="flex justify-between">
          <span className="text-foreground-muted">${room.pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}</span>
          <span>${roomRate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground-muted">Taxes & fees (12%)</span>
          <span>${taxes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground-muted">Cleaning fee</span>
          <span>${cleanFee}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-3 border-t border-[#D7E2EE]">
          <span>Total</span>
          <span className="text-primary">${total}</span>
        </div>
      </div>

      {/* Cancellation note */}
      <p className="text-xs text-emerald-600 flex items-center gap-1.5">
        <Check size={12} strokeWidth={2.5} /> Free cancellation before check-in
      </p>
    </div>
  );
}

// ─── Confirmation step ────────────────────────────────────────────────────────
function HotelConfirmationStep({ bookingId, hotelName }: { bookingId: string; hotelName: string }) {
  const [downloading, setDownloading] = useState(false);

  const downloadVoucher = async () => {
    setDownloading(true);
    try {
      const { default: $api } = await import("@shared/api");
      const res = await $api.get(`/bookings/${bookingId}/ticket`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href = url; a.download = `golobe-voucher-${bookingId.slice(0, 8)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download voucher. Please try from your bookings page.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold">Booking confirmed!</h2>
        <p className="text-foreground-muted">
          Your stay at <strong>{hotelName}</strong> is confirmed. A confirmation email with your voucher will be sent shortly.
        </p>
        <p className="text-sm font-mono bg-background rounded-lg px-4 py-2.5 inline-block border border-[#D7E2EE]">
          ID: {bookingId}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadVoucher}
          disabled={downloading}
          className="flex-1 px-6 py-3 bg-primary text-foreground-static rounded-xl text-sm font-semibold hover:bg-[#9BE0C8] transition-all disabled:opacity-60"
        >
          {downloading ? "Generating…" : "⬇ Download Voucher"}
        </button>
        <a href="/account/history" className="flex-1 px-6 py-3 border border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all text-center">
          View my bookings
        </a>
        <a href="/stays" className="flex-1 px-6 py-3 border border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all text-center">
          Find more hotels
        </a>
      </div>
    </div>
  );
}
