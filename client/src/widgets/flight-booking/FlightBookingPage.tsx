"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { flightApi } from "@features/flights/api/flightApi";
import { bookingApi } from "@features/flights/api/bookingApi";
import type { IFlight } from "@entities/flight/types/IFlight";
import PassengersForm from "./PassengersForm";
import CheckoutForm from "./CheckoutForm";
import FlightSummaryCard from "./FlightSummaryCard";
import { Container } from "@shared/ui/container";
import { cn } from "@shared/lib/utils";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

type Step = "passengers" | "payment" | "confirmation";

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
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    flightApi.getById(flightId).then((r) => {
      setFlight(r.data);
      setLoading(false);
    });
  }, [flightId]);

  const handlePassengersSubmit = async (passengerData: any[]) => {
    if (!flight) return;
    setPassengers(passengerData);
    setBookingError(null);

    try {
    const res = await bookingApi.initiateFlightBooking({
      flightId: flight.id,
      cabinClass: flight.cabinClass,
      passengers: passengerData,
    });

    setClientSecret(res.data.clientSecret);
    setBookingId(res.data.bookingId);
    setTotalPrice(res.data.totalPrice);
    setStep("payment");
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message ?? "Booking failed";
      const errs = e.response?.data?.errors;
      setBookingError(errs ? JSON.stringify(errs, null, 2) : msg);
      console.error('[booking error]', e.response?.data);
    }
  };

  const handlePaymentSuccess = async () => {
    await bookingApi.confirmBooking(bookingId);
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
        {(["passengers", "payment", "confirmation"] as Step[]).map((s, i) => {
          const labels = ["Passenger details", "Payment", "Confirmation"];
          const isDone = ["passengers", "payment", "confirmation"].indexOf(step) > i;
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
                  {labels[i]}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-[2px] bg-[#D7E2EE] mx-2" />}
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

          {step === "payment" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <CheckoutForm
                totalPrice={totalPrice}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep("passengers")}
              />
            </Elements>
          )}

          {step === "confirmation" && (
            <ConfirmationStep bookingId={bookingId} />
          )}
        </div>

        {/* Right: flight summary */}
        <div className="col-span-12 lg:col-span-5">
          <FlightSummaryCard
            flight={flight}
            passengersCount={passengersCount}
            totalPrice={step !== "passengers" ? totalPrice : undefined}
          />
        </div>
      </div>
    </Container>
  );
}

function ConfirmationStep({ bookingId }: { bookingId: string }) {
  return (
    <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
        <span className="text-3xl">✈️</span>
      </div>
      <h2 className="text-2xl font-bold">Booking confirmed!</h2>
      <p className="text-foreground-muted">
        Your flight has been successfully booked. A confirmation email will be sent shortly.
      </p>
      <p className="text-sm font-mono bg-background rounded-lg px-4 py-2 inline-block">
        Booking ID: {bookingId}
      </p>
      <div className="flex gap-3 justify-center pt-4">
        <a href="/account/history" className="px-6 py-2.5 bg-primary text-foreground-static rounded-lg text-sm font-medium hover:bg-[#9BE0C8] transition-all">
          View my bookings
        </a>
        <a href="/flights" className="px-6 py-2.5 border border-[#D7E2EE] rounded-lg text-sm font-medium hover:border-primary transition-all">
          Search more flights
        </a>
      </div>
    </div>
  );
}
