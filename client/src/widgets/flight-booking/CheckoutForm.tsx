"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { AppButton } from "@shared/ui/appButton";
import { ShieldCheck, ArrowLeft } from "lucide-react";

interface Props {
  totalPrice: number;
  onSuccess: () => Promise<void>;
  onBack: () => void;
}

export default function CheckoutForm({ totalPrice, onSuccess, onBack }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

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

        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: { billingDetails: { address: { country: "UA" } } },
          }}
        />

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
          className="flex items-center gap-2 px-5 py-3 border border-[#D7E2EE] rounded-xl text-sm font-medium hover:border-primary transition-all"
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

      <p className="text-xs text-center text-foreground-muted">
        Test card: <span className="font-mono font-semibold">4242 4242 4242 4242</span> · any future date · any CVC
      </p>
    </form>
  );
}
