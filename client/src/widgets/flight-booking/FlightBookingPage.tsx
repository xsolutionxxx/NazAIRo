"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { flightApi } from "@features/flights/api/flightApi";
import { bookingApi } from "@features/flights/api/bookingApi";
import type { IFlight } from "@entities/flight/types/IFlight";
import PassengersForm from "./PassengersForm";
import CheckoutForm from "./CheckoutForm";
import FlightSummaryCard from "./FlightSummaryCard";
import SeatMap from "./SeatMap";
import { Container } from "@shared/ui/container";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import $api from "@shared/api";
import type { SavedPaymentMethod } from "./CheckoutForm";
import BoardingPassCard from "@widgets/booking-card/BoardingPassCard";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

type Step = "passengers" | "seats" | "payment" | "confirmation";
const STEPS: Step[] = ["passengers", "seats", "payment", "confirmation"];
const STEP_LABELS = ["Passenger details", "Seat selection", "Payment", "Confirmation"];

interface Props {
  flightId: string;
  passengersCount: number;
}

export default function FlightBookingPage({ flightId, passengersCount }: Props) {
  const [flight, setFlight] = useState<IFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("passengers");
  const [clientSecret, setClientSecret] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Refs for cleanup on unmount
  const bookingIdRef = useRef("");
  const stepRef      = useRef<Step>("passengers");
  useEffect(() => { bookingIdRef.current = bookingId; }, [bookingId]);
  useEffect(() => { stepRef.current = step; }, [step]);

  // Delete PENDING booking if user navigates away before confirming
  useEffect(() => {
    return () => {
      const id = bookingIdRef.current;
      if (id && stepRef.current !== "confirmation") {
        bookingApi.abandonBooking(id).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    flightApi.getById(flightId).then((r) => {
      setFlight(r.data);
      setLoading(false);
    });
    $api.get<SavedPaymentMethod[]>("/payment-methods")
      .then((r) => setSavedMethods(r.data))
      .catch(() => {});
  }, [flightId]);

  const handlePassengersSubmit = async (passengerData: any[]) => {
    setPassengers(passengerData);
    setBookingError(null);
    setSeatsLoading(true);
    try {
      const res = await $api.get<string[]>(`/flights/${flightId}/seats`);
      setBookedSeats(res.data);
    } catch {
      setBookedSeats([]);
    } finally {
      setSeatsLoading(false);
    }
    setSelectedSeats([]);
    setStep("seats");
  };

  const handleSeatsConfirm = async () => {
    if (!flight) return;
    setBookingError(null);
    const passengersWithSeats = passengers.map((p, i) => ({
      ...p,
      seatNumber: selectedSeats[i] ?? undefined,
    }));

    try {
      const res = await bookingApi.initiateFlightBooking({
        flightId: flight.id,
        cabinClass: flight.cabinClass,
        passengers: passengersWithSeats,
      });
      setClientSecret(res.data.clientSecret);
      setBookingId(res.data.bookingId);
      setTotalPrice(res.data.totalPrice);
      setStep("payment");
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message ?? "Booking failed";
      const errs = e.response?.data?.errors;
      setBookingError(errs ? JSON.stringify(errs, null, 2) : msg);
    }
  };

  const handlePaymentSuccess = async () => {
    const res = await bookingApi.confirmBooking(bookingId);
    setConfirmedBooking(res.data);
    setStep("confirmation");
  };

  if (loading) return (
    <Container className="pt-12 pb-30">
      <div className="h-96 bg-surface rounded-2xl animate-pulse" />
    </Container>
  );

  if (!flight) return (
    <Container className="pt-12 pb-30 text-center">
      <p className="text-foreground-muted">Flight not found.</p>
    </Container>
  );

  return (
    <Container className="pt-12 pb-30">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => {
          const isDone = STEPS.indexOf(step) > i;
          const isActive = step === s;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  isActive && "bg-primary text-foreground-static",
                  isDone && "bg-primary/30 text-foreground",
                  !isActive && !isDone && "bg-background border-2 border-[#D7E2EE] text-foreground-muted",
                )}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium hidden sm:block",
                  isActive ? "text-foreground" : "text-foreground-muted",
                )}>
                  {STEP_LABELS[i]}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-[2px] bg-[#D7E2EE] mx-2" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: form */}
        <div className="col-span-12 lg:col-span-7">
          {step === "passengers" && (
            <>
              <PassengersForm
                count={passengersCount}
                onSubmit={handlePassengersSubmit}
              />
              {bookingError && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive whitespace-pre-wrap">
                  <strong>Error:</strong> {bookingError}
                </div>
              )}
            </>
          )}

          {step === "seats" && (
            <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold">Choose your seats</h2>
                <p className="text-sm text-foreground-muted mt-1">
                  Select {passengersCount} seat{passengersCount > 1 ? "s" : ""} for your flight
                </p>
              </div>

              {seatsLoading ? (
                <div className="h-48 flex items-center justify-center text-foreground-muted text-sm">
                  Loading seat map…
                </div>
              ) : (
                <SeatMap
                  totalSeats={flight.totalSeats}
                  cabinClass={flight.cabinClass as any}
                  bookedSeats={bookedSeats}
                  selectedSeats={selectedSeats}
                  passengersCount={passengersCount}
                  onChange={setSelectedSeats}
                />
              )}

              {bookingError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                  {bookingError}
                </div>
              )}

              <div className="flex gap-3">
                <AppButton
                  intent="outline"
                  onClick={() => setStep("passengers")}
                  className="px-6 h-12 rounded-xl"
                >
                  Back
                </AppButton>
                <AppButton
                  onClick={handleSeatsConfirm}
                  disabled={selectedSeats.length < passengersCount}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {selectedSeats.length < passengersCount
                    ? `Select ${passengersCount - selectedSeats.length} more seat${passengersCount - selectedSeats.length > 1 ? "s" : ""}`
                    : "Continue to payment"}
                </AppButton>
              </div>
            </div>
          )}

          {step === "payment" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <CheckoutForm
                totalPrice={totalPrice}
                clientSecret={clientSecret}
                bookingId={bookingId}
                savedMethods={savedMethods}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep("seats")}
              />
            </Elements>
          )}

          {step === "confirmation" && (
            <ConfirmationStep bookingId={bookingId} booking={confirmedBooking} />
          )}
        </div>

        {/* Right: flight summary */}
        <div className="col-span-12 lg:col-span-5">
          <FlightSummaryCard
            flight={flight}
            passengersCount={passengersCount}
            totalPrice={step !== "passengers" && step !== "seats" ? totalPrice : undefined}
            selectedSeats={step === "seats" || step === "payment" ? selectedSeats : undefined}
          />
        </div>
      </div>
    </Container>
  );
}

function ConfirmationStep({ bookingId, booking }: { bookingId: string; booking: any }) {
  return (
    <div className="space-y-5">
      {/* Success header */}
      <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-foreground-static text-lg">✓</span>
        </div>
        <div>
          <p className="font-bold text-foreground">Booking confirmed!</p>
          <p className="text-sm text-foreground-muted">A confirmation email with your e-ticket has been sent.</p>
        </div>
      </div>

      {/* Boarding pass card */}
      {booking && <BoardingPassCard booking={booking} showDownload />}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <a
          href="/account/history"
          className="flex-1 text-center px-6 py-3 border-2 border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all"
        >
          View my bookings
        </a>
        <a
          href="/flights"
          className="flex-1 text-center px-6 py-3 bg-primary text-foreground-static rounded-xl text-sm font-medium hover:bg-[#9BE0C8] transition-all"
        >
          Search more flights
        </a>
      </div>
    </div>
  );
}
