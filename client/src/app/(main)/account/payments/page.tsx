"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    useStripe,
    useElements,
    CardElement,
} from "@stripe/react-stripe-js";
import { CreditCard, Trash2, Star, Plus, ShieldCheck, X } from "lucide-react";
import $api from "@shared/api";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";
import { AppTitle } from "@/shared/ui/appTitle";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const BRAND_COLORS: Record<string, string> = {
    VISA: "bg-blue-600",
    MASTERCARD: "bg-red-500",
    AMEX: "bg-green-600",
    DISCOVER: "bg-orange-500",
};

interface PaymentMethod {
    id: string;
    type: string;
    lastFour: string;
    isDefault: boolean;
}

const pmApi = {
    getAll: () => $api.get<PaymentMethod[]>("/payment-methods"),
    createSetupIntent: () =>
        $api.post<{ clientSecret: string }>("/payment-methods/setup-intent"),
    save: (d: any) => $api.post<PaymentMethod>("/payment-methods", d),
    setDefault: (id: string) =>
        $api.patch<PaymentMethod[]>(`/payment-methods/${id}/default`),
    remove: (id: string) => $api.delete(`/payment-methods/${id}`),
};

export default function Payments() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [clientSecret, setClientSecret] = useState("");

    const load = () => {
        pmApi
            .getAll()
            .then((r) => {
                setMethods(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const handleAddClick = async () => {
        const res = await pmApi.createSetupIntent();
        setClientSecret(res.data.clientSecret);
        setShowAdd(true);
    };

    const handleSaved = (method: PaymentMethod) => {
        setMethods((p) => [...p, method]);
        setShowAdd(false);
        setClientSecret("");
    };

    const handleSetDefault = async (id: string) => {
        const res = await pmApi.setDefault(id);
        setMethods(res.data);
    };

    const handleRemove = async (id: string) => {
        const res = await pmApi.remove(id);
        setMethods(res.data);
    };

    return (
        <div className="w-full mb-26">
            <div className="flex items-center justify-between mb-6">
                <AppTitle
                    as="h1"
                    size="lg"
                    text="Payment methods"
                    className="ml-2 mr-12 mb-4"
                />
                {!showAdd && (
                    <AppButton
                        icon={Plus}
                        onClick={handleAddClick}
                        className="rounded-xl px-4 py-2.5 text-sm"
                    >
                        Add card
                    </AppButton>
                )}
            </div>

            {showAdd && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <AddCardForm
                        clientSecret={clientSecret}
                        onSaved={handleSaved}
                        onCancel={() => {
                            setShowAdd(false);
                            setClientSecret("");
                        }}
                    />
                </Elements>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-surface rounded-2xl animate-pulse border border-[#D7E2EE]"
                        />
                    ))}
                </div>
            ) : methods.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                    <CreditCard
                        size={48}
                        strokeWidth={1}
                        className="text-foreground-muted"
                    />
                    <p className="font-semibold">No payment methods saved</p>
                    <p className="text-sm text-foreground-muted">
                        Add a card to speed up your future bookings
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {methods.map((m) => (
                        <CardRow
                            key={m.id}
                            method={m}
                            onSetDefault={() => handleSetDefault(m.id)}
                            onRemove={() => handleRemove(m.id)}
                        />
                    ))}
                </div>
            )}

            <div className="mt-8 flex items-start gap-3 p-4 bg-primary-muted rounded-xl text-sm text-foreground-muted">
                <ShieldCheck
                    size={18}
                    strokeWidth={1.5}
                    className="text-primary shrink-0 mt-0.5"
                />
                <p>
                    Your card details are securely stored by Stripe and never
                    touch our servers. We comply with PCI DSS standards.
                </p>
            </div>
        </div>
    );
}

// ─── Card row ─────────────────────────────────────────────────────────────────

function CardRow({
    method,
    onSetDefault,
    onRemove,
}: {
    method: PaymentMethod;
    onSetDefault: () => void;
    onRemove: () => void;
}) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        if (!confirm("Remove this payment method?")) return;
        setRemoving(true);
        await onRemove();
    };

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                method.isDefault
                    ? "border-primary bg-primary-muted"
                    : "border-[#D7E2EE] bg-surface hover:border-primary/50",
            )}
        >
            {/* Brand badge */}
            <div
                className={cn(
                    "w-12 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0",
                    BRAND_COLORS[method.type] ?? "bg-foreground-muted",
                )}
            >
                {method.type.slice(0, 4)}
            </div>

            {/* Card info */}
            <div className="flex-1">
                <p className="font-semibold text-sm tracking-widest">
                    •••• •••• •••• {method.lastFour}
                </p>
                <p className="text-xs text-foreground-muted capitalize">
                    {method.type.toLowerCase()}
                    {method.isDefault && (
                        <span className="ml-2 text-primary font-medium">
                            Default
                        </span>
                    )}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {!method.isDefault && (
                    <button
                        onClick={onSetDefault}
                        className="flex items-center gap-1 text-xs text-foreground-muted hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-background"
                    >
                        <Star size={13} strokeWidth={1.5} />
                        Set default
                    </button>
                )}
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                >
                    <Trash2 size={15} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}

// ─── Add card form ────────────────────────────────────────────────────────────

function AddCardForm({
    clientSecret,
    onSaved,
    onCancel,
}: {
    clientSecret: string;
    onSaved: (m: any) => void;
    onCancel: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setSaving(true);
        setError("");

        const card = elements.getElement(CardElement);
        if (!card) return;

        const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(
            clientSecret,
            {
                payment_method: { card },
            },
        );

        if (stripeErr) {
            setError(stripeErr.message ?? "Card error");
            setSaving(false);
            return;
        }

        try {
            const res = await pmApi.save({ setupIntentId: setupIntent!.id });
            onSaved(res.data);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to save card");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl border border-[#D7E2EE] p-5 mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add new card</h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded-lg hover:bg-background text-foreground-muted"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>
            </div>

            <div className="p-3 border-2 border-input-secondary rounded-lg hover:border-primary focus-within:border-primary transition-colors mb-4">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "15px",
                                color: "#1c1b1f",
                                "::placeholder": { color: "#79747E" },
                            },
                            invalid: { color: "#fd736e" },
                        },
                    }}
                />
            </div>

            {error && <p className="text-sm text-destructive mb-3">{error}</p>}

            <div className="flex gap-3">
                <AppButton
                    type="submit"
                    disabled={!stripe || saving}
                    className="rounded-xl px-5"
                >
                    {saving ? "Saving…" : "Save card"}
                </AppButton>
                <AppButton
                    type="button"
                    intent="outline"
                    onClick={onCancel}
                    className="rounded-xl px-5"
                >
                    Cancel
                </AppButton>
            </div>

            <p className="text-xs text-foreground-muted mt-3 flex items-center gap-1.5">
                <ShieldCheck
                    size={12}
                    strokeWidth={1.5}
                    className="text-primary"
                />
                Test card: 4242 4242 4242 4242 · any future date · any CVC
            </p>
        </form>
    );
}
