"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { bookingApi } from "@features/flights/api/bookingApi";
import CheckoutForm, { SavedPaymentMethod } from "@widgets/flight-booking/CheckoutForm";
import { Container } from "@shared/ui/container";
import { AirlineLogo } from "@shared/ui/airlineLogo";
import { ArrowRight, Clock, Plane, Hotel, Ban, Trash2 } from "lucide-react";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import $api from "@shared/api";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Props {
  bookingId: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ResumeBookingPage({ bookingId }: Props) {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [booking, setBooking]       = useState<any>(null);
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([]);
  const [confirmed, setConfirmed]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      bookingApi.resumeBooking(bookingId),
      $api.get<SavedPaymentMethod[]>("/payment-methods").catch(() => ({ data: [] })),
    ])
      .then(([resumeRes, pmRes]) => {
        setClientSecret(resumeRes.data.clientSecret);
        setBooking(resumeRes.data.booking);
        setSavedMethods((pmRes as any).data ?? []);
      })
      .catch((e) => {
        setError(e.response?.data?.message ?? "Failed to load booking");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePaymentSuccess = async () => {
    await bookingApi.confirmBooking(bookingId);
    setConfirmed(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(bookingId);
      window.location.href = "/account/history";
    } catch {
      setCancelling(false);
    }
  };

  if (loading) return (
    <Container className="pt-16 pb-32">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-surface rounded-xl animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl animate-pulse" />
        <div className="h-96 bg-surface rounded-2xl animate-pulse" />
      </div>
    </Container>
  );

  if (error) return (
    <Container className="pt-16 pb-32 text-center">
      <p className="text-foreground-muted">{error}</p>
      <a href="/account/history" className="mt-4 inline-block text-primary hover:underline text-sm">
        ← Back to bookings
      </a>
    </Container>
  );

  if (confirmed) return (
    <Container className="pt-16 pb-32">
      <div className="max-w-2xl mx-auto bg-surface rounded-2xl border border-[#D7E2EE] p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <span className="text-3xl">✈️</span>
        </div>
        <h2 className="text-2xl font-bold">Booking confirmed!</h2>
        <p className="text-foreground-muted">Payment completed successfully.</p>
        <div className="flex gap-3 justify-center pt-4">
          <a
            href="/account/history"
            className="px-6 py-2.5 bg-primary text-foreground-static rounded-lg text-sm font-medium hover:bg-[#9BE0C8] transition-all"
          >
            View my bookings
          </a>
        </div>
      </div>
    </Container>
  );

  const isFlight = booking?.type === "FLIGHT";
  const fb = booking?.flightBooking;
  const hb = booking?.hotelBooking;

  return (
    <Container className="pt-12 pb-32">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <a
          href="/account/history"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-8 transition-colors"
        >
          ← Back to bookings
        </a>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isFlight ? "bg-blue-50 dark:bg-blue-950" : "bg-amber-50 dark:bg-amber-950",
          )}>
            {isFlight
              ? <Plane size={18} className="text-blue-500" strokeWidth={1.5} />
              : <Hotel size={18} className="text-amber-500" strokeWidth={1.5} />}
          </div>
          <div>
            <h1 className="text-xl font-bold">Complete your booking</h1>
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
              <Clock size={11} strokeWidth={2} />
              Payment pending
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left: payment */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                <CheckoutForm
                  totalPrice={Number(booking?.totalPrice)}
                  clientSecret={clientSecret}
                  bookingId={bookingId}
                  savedMethods={savedMethods}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => window.history.back()}
                />
              </Elements>
            )}

            {/* Cancel / delete section */}
            <div className="border border-destructive/20 rounded-2xl p-5 space-y-3 bg-destructive/5">
              <p className="text-sm font-semibold text-destructive">Cancel this booking</p>
              <p className="text-xs text-foreground-muted">
                If you no longer need this booking, you can remove it. This action cannot be undone.
              </p>
              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="flex items-center gap-2 text-sm text-destructive font-medium hover:underline"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  Remove this booking
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium flex-1">Are you sure?</p>
                  <AppButton
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 text-sm rounded-xl bg-destructive hover:bg-destructive/80 text-white"
                  >
                    {cancelling ? "Removing…" : "Yes, remove"}
                  </AppButton>
                  <AppButton
                    intent="outline"
                    onClick={() => setCancelConfirm(false)}
                    className="px-4 py-2 text-sm rounded-xl"
                  >
                    Keep it
                  </AppButton>
                </div>
              )}
            </div>
          </div>

          {/* Right: booking summary */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6 sticky top-6 space-y-5">
              <h3 className="font-bold text-base">Booking summary</h3>

              {isFlight && fb && (
                <>
                  <div className="flex items-center gap-3">
                    <AirlineLogo iata={fb.flight.airline.iata} name={fb.flight.airline.name} />
                    <div>
                      <p className="font-semibold text-sm">{fb.flight.airline.name}</p>
                      <p className="text-xs text-foreground-muted">{fb.flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div>
                        <p className="text-xl font-bold">{fmtTime(fb.flight.departureTime)}</p>
                        <p className="text-sm font-semibold text-primary">{fb.flight.departureAirport.iata}</p>
                        <p className="text-xs text-foreground-muted">{fb.flight.departureAirport.city}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 px-2">
                        <ArrowRight size={14} strokeWidth={1.5} className="text-foreground-muted" />
                        <span className="text-[10px] text-foreground-muted">Non-stop</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{fmtTime(fb.flight.arrivalTime)}</p>
                        <p className="text-sm font-semibold text-primary">{fb.flight.arrivalAirport.iata}</p>
                        <p className="text-xs text-foreground-muted">{fb.flight.arrivalAirport.city}</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground-muted mt-2">{fmt(fb.flight.departureTime)}</p>
                  </div>

                  {/* Passengers */}
                  {fb.passengers?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Passengers</p>
                      {fb.passengers.map((p: any, i: number) => (
                        <div key={p.id} className="flex items-center justify-between text-sm bg-background rounded-lg px-3 py-2">
                          <span>{i + 1}. {p.firstName} {p.lastName}</span>
                          {p.seatNumber && (
                            <span className="text-xs font-semibold text-primary">{p.seatNumber}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!isFlight && hb && (
                <>
                  <div>
                    <p className="font-semibold">{hb.room.hotel.name}</p>
                    <p className="text-sm text-foreground-muted">{hb.room.hotel.city}</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Check-in</span>
                      <span className="font-medium">{fmt(hb.checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Check-out</span>
                      <span className="font-medium">{fmt(hb.checkOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Room</span>
                      <span className="font-medium">{hb.room.type} · {hb.room.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Guests</span>
                      <span className="font-medium">{hb.guestCount}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-[#D7E2EE] pt-4 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">${Number(booking?.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
