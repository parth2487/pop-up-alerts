import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";

interface PlanFeature {
  feature_name: string;
  description?: string;
  limit?: number | string;
}

interface SubscriptionDetails {
  id: string;
  provider: "stripe" | "paypal";
  status: string;
  plan_type: "monthly" | "yearly";
  amount: string | number;
  currency: string;
  plan_features?: PlanFeature[];
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  customer_email?: string;
  paypal_subscription_id?: string;
  paypal_payer_email?: string;
  paypal_plan_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    if (!user) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/billing/paypal/details", {
        userId: user.id,
      });
      const data = response.data;

      const paypalPlanIds = {
        monthly: import.meta.env.VITE_PAYPAL_PLAN_MONTHLY,
        yearly: import.meta.env.VITE_PAYPAL_PLAN_YEARLY,
      };

      const mappedSubscription: SubscriptionDetails = {
        id: data.id,
        provider: "paypal",
        status: data.status,
        plan_type:
          data.plan_id === paypalPlanIds.monthly ? "monthly" : "yearly",
        amount: data.billing_info?.last_payment?.amount?.value || "0.0",
        currency:
          data.billing_info?.last_payment?.amount?.currency_code || "USD",
        paypal_subscription_id: data.id,
        paypal_payer_email: data.subscriber?.email_address,
        paypal_plan_id: data.plan_id,
        current_period_start: data.start_time,
        current_period_end: data.billing_info?.next_billing_time,
        cancel_at_period_end: false,
        created_at: data.create_time,
        updated_at: data.update_time,
      };
      console.log("mappedSubscription :: ", mappedSubscription);
      setSubscription(mappedSubscription);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load subscription details";
      setError(errorMessage);
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // POLLING FUNCTION (waits until DB returns subscription = cancelled)
  // ------------------------------------------------------------
  const pollSubscriptionStatus = async (maxAttempts = 20, interval = 5000) => {
    let attempts = 0;

    return new Promise<void>((resolve, reject) => {
      const poll = async () => {
        attempts++;

        try {
          const res = await apiClient.get("/billing/my-cancel-subscription");
          const status = res.data?.subscription;

          if (status === "canceled") {
            setSubscription((prev) =>
              prev
                ? {
                    ...prev,
                    status: "CANCELED",
                    cancel_at_period_end: true,
                  }
                : prev
            );

            return resolve();
          }

          if (attempts >= maxAttempts) {
            return reject(
              new Error("Timeout: Subscription not cancelled in expected time.")
            );
          }

          setTimeout(poll, interval);
        } catch (err) {
          console.error("Polling error:", err);
          setTimeout(poll, interval);
        }
      };

      poll();
    });
  };

  // ------------------------------------------------------------
  // CANCEL SUBSCRIPTION
  // ------------------------------------------------------------
  const handleCancelSubscription = async () => {
    if (!subscription?.paypal_subscription_id) return;
    setCanceling(true);
    setError("");

    try {
      await apiClient.post(`/billing/paypal/cancel`, {
        subscriptionID: subscription.paypal_subscription_id,
      });

      // Poll backend until DB status updates
      await pollSubscriptionStatus();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel subscription";
      setError(errorMessage);
      console.error("Error canceling subscription:", err);
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (
    amount: number | string | undefined,
    currency: string | undefined
  ) => {
    if (amount === undefined || amount === null || !currency) return "N/A";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(numAmount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    console.log("status ---->  ", status);
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      case "past_due":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    return provider === "stripe"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-blue-100 text-blue-700";
  };

  const getPlanName = (planType: string) => {
    return planType === "monthly" ? "Monthly Plan" : "Yearly Plan";
  };

  // ------------------------------------------------------------
  // LOADING & ERROR STATES
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Subscription
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchSubscription}
              className="px-6 py-2.5 font-medium text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Subscription Found
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have an active subscription.
          </p>
          <button
            onClick={() => navigate("/app/account")}
            className="px-6 py-2.5 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN RETURN (UI)
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/app/account")}
          className="mb-6 text-orange-600 hover:text-orange-700 flex items-center gap-2 font-medium transition-colors group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Account
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Subscription Details
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-400 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {getPlanName(subscription.plan_type)}
                </h2>
                <p className="text-indigo-100 text-sm sm:text-base">
                  Manage your subscription and billing information
                </p>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase ${getProviderBadgeColor(
                    subscription.provider
                  )}`}
                >
                  {subscription.provider}
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadgeColor(
                    subscription.status
                  )}`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* PLAN INFO */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Plan Information
                </h3>

                <div className="space-y-5">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Price
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          subscription.amount,
                          subscription.currency
                        )}
                      </span>
                      <span className="text-sm text-gray-500">
                        /
                        {subscription.plan_type === "monthly"
                          ? "month"
                          : "year"}
                      </span>
                    </div>
                  </div>

                  {subscription.current_period_start && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Current Period Start
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {formatDate(subscription.current_period_start)}
                      </div>
                    </div>
                  )}

                  {subscription.current_period_end && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Next Billing Time
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {formatDate(subscription.current_period_end)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACCOUNT INFO */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  Account Information
                </h3>

                <div className="space-y-5">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Payment Method
                    </div>
                    <div className="text-base font-semibold text-gray-900 capitalize">
                      {subscription.provider}
                    </div>
                  </div>

                  {subscription.customer_email && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Email
                      </div>
                      <div className="text-base font-semibold text-gray-900 break-all">
                        {subscription.customer_email}
                      </div>
                    </div>
                  )}

                  {subscription.paypal_payer_email && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        PayPal Email
                      </div>
                      <div className="text-base font-semibold text-gray-900 break-all">
                        {subscription.paypal_payer_email}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Subscription Since
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {formatDate(subscription.created_at)}
                    </div>
                  </div>

                  {(subscription.paypal_subscription_id ||
                    subscription.stripe_subscription_id) && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Subscription ID
                      </div>
                      <div className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded border border-gray-200">
                        {subscription.paypal_subscription_id ||
                          subscription.stripe_subscription_id}
                      </div>
                    </div>
                  )}

                  {/* CANCEL BUTTON */}
                  {subscription.status.toLowerCase() === "active" && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="w-full mt-4 px-6 py-3 font-semibold text-white bg-red-600 
                                 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {canceling
                        ? "Cancelling... Waiting for confirmation..."
                        : "Cancel Subscription"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PLAN FEATURES */}
            {subscription.plan_features &&
              subscription.plan_features.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Plan Features
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {subscription.plan_features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start bg-gray-50 rounded-lg p-4"
                      >
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {feature.feature_name}
                          </div>
                          {feature.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {feature.description}
                            </div>
                          )}
                          {feature.limit && (
                            <div className="text-xs text-gray-500 mt-1">
                              Limit: {feature.limit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {canceling && (
        <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-brand-primary border-t-transparent mb-6" />
          <h2 className="text-xl font-semibold text-gray-800">
            Please wait a few seconds…
          </h2>
          <p className="text-gray-600 mt-2 text-center max-w-sm">
            We’re cancelling your payment.
            <br />
            Do not refresh or close this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
