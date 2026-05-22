import { useState, useEffect, useRef } from "react";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

declare global {
  interface Window {
    paypal: any;
  }
}

/* =====================================
   Full Screen Loader
===================================== */
const PaymentProcessingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-brand-primary border-t-transparent mb-6" />
      <h2 className="text-xl font-semibold text-gray-800">
        Please wait a few seconds…
      </h2>
      <p className="text-gray-600 mt-2 text-center max-w-sm">
        We’re confirming your payment.
        <br />
        Do not refresh or close this page.
      </p>
    </div>
  );
};

/* =====================================
   Types
===================================== */
interface PayPalButtonProps {
  planType: "monthly" | "yearly";
  onProcessing: (value: boolean) => void;
}

interface Plan {
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: PriceInfo;
    yearly: PriceInfo;
  };
}

interface PriceInfo {
  price: number;
  interval: "month" | "year";
  stripePriceId: string;
}

/* =====================================
   Plan
===================================== */
const proPlan: Plan = {
  name: "Pro Plan",
  description: "Full features for growing businesses, with flexible billing.",
  features: [
    "Unlimited Widgets",
    "10 Workspaces",
    "Priority Support",
    "Advanced Analytics",
  ],
  pricing: {
    monthly: {
      price: 15,
      interval: "month",
      stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY!,
    },
    yearly: {
      price: 40,
      interval: "year",
      stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY!,
    },
  },
};

const paypalPlanIds: Record<"monthly" | "yearly", string> = {
  monthly: import.meta.env.VITE_PAYPAL_PLAN_MONTHLY,
  yearly: import.meta.env.VITE_PAYPAL_PLAN_YEARLY,
};

/* =====================================
   PayPal Button
===================================== */
const PayPalButtonComponent = ({
  planType,
  onProcessing,
}: PayPalButtonProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.paypal || !paypalRef.current) return;

    const button = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
      },

      createSubscription: (_: any, actions: any) =>
        actions.subscription.create({
          plan_id: paypalPlanIds[planType],
        }),

      onApprove: async (data: { subscriptionID: string }) => {
        toast.success("Processing subscription...");
        onProcessing(true);

        try {
          await apiClient.post("/billing/paypal-subscription/activate", {
            subscriptionID: data.subscriptionID,
            planType,
          });
        } catch (err) {
          console.error(err);
          toast.error("PayPal activation failed.");
          onProcessing(false);
        }
      },

      onError: (err: unknown) => {
        console.error(err);
        toast.error("PayPal error, please try again.");
      },
    });

    button.render(paypalRef.current);
    return () => button.close();
  }, [planType, onProcessing]);

  return <div ref={paypalRef} />;
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "active" | "pending" | "canceled" | "inactive" | null
  >(null);

  /* =====================================
     Load PayPal + Fetch Subscription
  ===================================== */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${
      import.meta.env.VITE_PAYPAL_CLIENT_ID
    }&vault=true&intent=subscription&currency=USD`;
    script.onload = () => setPaypalSdkReady(true);
    document.body.appendChild(script);

    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await apiClient.get("/billing/my-subscription");
      setSubscriptionStatus(res.data.subscription);

      if (res.data.subscription === "pending") {
        setProcessingPayment(true);
      }
    } catch {
      setSubscriptionStatus(null);
    }
  };

  /* =====================================
     Poll While Pending
  ===================================== */
  useEffect(() => {
    if (!processingPayment) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get("/billing/my-subscription");
        const status = res.data.subscription;

        setSubscriptionStatus(status);

        if (status === "active") {
          clearInterval(interval);
          setProcessingPayment(false);
          toast.success("Subscription activated 🎉");
          setTimeout(() => window.location.reload(), 1200);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [processingPayment]);

  /* =====================================
     Stripe Checkout
  ===================================== */
  const handleStripeCheckout = async () => {
    setProcessingPayment(true);
    setLoadingStripe(true);

    try {
      const priceId = proPlan.pricing[billingCycle].stripePriceId;
      const res = await apiClient.post("/billing/create-checkout-session", {
        priceId,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      toast.error("Stripe checkout failed.");
      setProcessingPayment(false);
    } finally {
      setLoadingStripe(false);
    }
  };

  const currentPriceInfo = proPlan.pricing[billingCycle];

  /* =====================================
     UI
  ===================================== */
  return (
    <>
      {processingPayment && <PaymentProcessingOverlay />}

      <div className="bg-gray-50 min-h-screen py-12 text-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h1>

          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that's right for you.
          </p>

          {/* ================= Billing Toggle ================= */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span
              className={
                billingCycle === "monthly" ? "font-semibold" : "text-gray-500"
              }
            >
              Monthly
            </span>

            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                billingCycle === "monthly" ? "bg-gray-300" : "bg-brand-primary"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full transition-transform ${
                  billingCycle === "monthly" ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>

            <span
              className={
                billingCycle === "yearly" ? "font-semibold" : "text-gray-500"
              }
            >
              Yearly
            </span>

            <span className="bg-orange-100 text-brand-primary text-xs font-bold px-2 py-1 rounded-full">
              SAVE 78%
            </span>
          </div>

          {/* ================= Pricing Card ================= */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border">
              <h2 className="text-2xl font-semibold text-gray-900">
                {proPlan.name}
              </h2>

              <p className="mt-2 text-gray-600">{proPlan.description}</p>

              <div className="mt-6">
                <span className="text-5xl font-bold text-gray-900">
                  ${currentPriceInfo.price}
                </span>
                <span className="text-lg text-gray-600">
                  / {currentPriceInfo.interval}
                </span>
              </div>

              <ul className="mt-6 space-y-4">
                {proPlan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <span className="text-green-500 mr-2">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* ================= Payment Section ================= */}
              <div className="mt-8 space-y-4">
                {subscriptionStatus === "active" ? (
                  <p className="text-green-600 font-semibold text-center">
                    ✅ You already have an active subscription
                  </p>
                ) : (
                  !processingPayment && (
                    <>
                      {/* Stripe */}
                      <button
                        onClick={handleStripeCheckout}
                        disabled={loadingStripe}
                        className="w-full bg-brand-primary text-white py-3 rounded-lg"
                      >
                        {loadingStripe
                          ? "Processing..."
                          : "Pay with Card (Stripe)"}
                      </button>

                      {/* PayPal */}
                      {paypalSdkReady ? (
                        <PayPalButtonComponent
                          planType={billingCycle}
                          onProcessing={setProcessingPayment}
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          Loading PayPal...
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
