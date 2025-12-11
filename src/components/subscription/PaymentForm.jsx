import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { success_toaster, error_toaster } from "@/utilities/Toaster";

export default function PaymentForm({
  customerEmail,
  setCustomerEmail,
  onSubmit,
  loading,
  totalPrice,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    if (!customerEmail) {
      setError("Email is required");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        email: customerEmail,
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      return;
    }

    onSubmit(paymentMethod.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Customer Email</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="w-full border rounded-md px-3 py-3"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-md bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-theme text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay $${totalPrice}/mo`}
      </button>
    </form>
  );
}
