"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { AppButton } from "@shared/ui/appButton";
import $api from "@shared/api";
import { ShieldCheck, ArrowLeft, CreditCard, Plus } from "lucide-react";
import { cn } from "@shared/lib/utils";

export interface SavedPaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  providerId: string;
  isDefault: boolean;
}

interface Props {
  totalPrice: number;
  clientSecret: string;
  bookingId: string;
  onSuccess: () => Promise<void>;
  onBack: () => void;
  savedMethods?: SavedPaymentMethod[];
}

const BRAND_COLORS: Record<string, string> = {
  VISA: "bg-blue-600",
  MASTERCARD: "bg-red-500",
  AMEX: "bg-green-600",
  DISCOVER: "bg-orange-500",
};

export default function CheckoutForm({ totalPrice, clientSecret, bookingId, onSuccess, onBack, savedMethods = [] }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const defaultMethod = savedMethods.find((m) => m.isDefault) ?? savedMethods[0];
  const [selectedMethodId, setSelectedMethodId] = useState<string | "new">(
    defaultMethod ? defaultMethod.providerId : "new",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) return;
    setProcessing(true);
    setError(null);

    if (selectedMethodId !== "new") {
      try {
        await $api.post(`/bookings/${bookingId}/paysaved`, { paymentMethodId: selectedMethodId });
        await onSuccess();
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Payment failed";
        setError(msg);
      }
      setProcessing(false);
      return;
    }

    // New card via PaymentElement
    if (!elements) return;
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment error");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setProcessing(false);
      return;
    }

    await onSuccess();
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface rounded-2xl border border-[#D7E2EE] p-6">
        <h2 className="text-lg font-bold mb-6">Payment</h2>

        {/* Saved payment methods */}
        {savedMethods.length > 0 && (
          <div className="mb-5 space-y-2">
            <p className="text-sm font-semibold text-foreground-muted mb-3">Saved cards</p>
            {savedMethods.map((m) => (
              <button
                key={m.providerId}
                type="button"
                onClick={() => setSelectedMethodId(m.providerId)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer",
                  selectedMethodId === m.providerId
                    ? "border-primary bg-primary-muted"
                    : "border-[#D7E2EE] hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                    BRAND_COLORS[m.type] ?? "bg-foreground-muted",
                  )}
                >
                  {m.type.slice(0, 4)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold tracking-widest">•••• {m.lastFour}</p>
                  {m.isDefault && <p className="text-xs text-primary">Default</p>}
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0",
                  selectedMethodId === m.providerId
                    ? "border-primary bg-primary"
                    : "border-foreground-muted",
                )} />
              </button>
            ))}

            {/* New card option */}
            <button
              type="button"
              onClick={() => setSelectedMethodId("new")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer",
                selectedMethodId === "new"
                  ? "border-primary bg-primary-muted"
                  : "border-[#D7E2EE] hover:border-primary/50",
              )}
            >
              <div className="w-10 h-7 rounded border-2 border-dashed border-foreground-muted flex items-center justify-center shrink-0">
                <Plus size={12} className="text-foreground-muted" />
              </div>
              <p className="flex-1 text-sm font-medium">Pay with new card</p>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 shrink-0",
                selectedMethodId === "new"
                  ? "border-primary bg-primary"
                  : "border-foreground-muted",
              )} />
            </button>
          </div>
        )}

        {/* Stripe PaymentElement — only for new card */}
        {selectedMethodId === "new" && (
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: { billingDetails: { address: { country: "UA" } } },
            }}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mt-6 text-xs text-foreground-muted">
          <ShieldCheck size={14} className="text-primary shrink-0" strokeWidth={1.5} />
          <span>Payments are secured by Stripe. Your card details are never stored on our servers.</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>

        <AppButton
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 h-14 rounded-xl text-base"
        >
          {processing ? "Processing payment..." : `Pay $${totalPrice}`}
        </AppButton>
      </div>

      {selectedMethodId === "new" && (
        <p className="text-xs text-center text-foreground-muted">
          Test card: <span className="font-mono font-semibold">4242 4242 4242 4242</span> · any future date · any CVC
        </p>
      )}
    </form>
  );
}
