// import { useState } from "react";
// import { createRazorpayOrder, verifyRazorpayPayment } from "../services/api";
// import toast from "react-hot-toast";

// const loadRazorpayScript = () =>
//   new Promise((resolve) => {
//     if (document.getElementById("razorpay-sdk")) return resolve(true);
//     const script = document.createElement("script");
//     script.id = "razorpay-sdk";
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });

// export function useRazorpay() {
//   const [loading, setLoading] = useState(false);

//   const pay = async ({ amount, user, shippingAddress, onSuccess }) => {
//     setLoading(true);

//     try {
//       // 🔥 Simulate payment delay
//       await new Promise((res) => setTimeout(res, 1500));

//       // 🔥 Fake response like Razorpay
//       const fakeResponse = {
//         razorpay_payment_id: "pay_demo_12345",
//         razorpay_order_id: "order_demo_12345",
//         razorpay_signature: "signature_demo",
//       };

//       toast.success("Payment successful! Order placed 🎉");

//       if (onSuccess) {
//         onSuccess({
//           id: "order_demo",
//           status: "paid",
//           shippingAddress,
//         });
//       }
//     } catch (err) {
//       toast.error("Payment failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { pay, loading };
// }

import { useState } from "react";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/api";
import toast from "react-hot-toast";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const pay = async ({
    amount,
    user,
    shippingAddress,
    onSuccess,
    onFailure,
  }) => {
    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const { data } = await createRazorpayOrder({ amount, shippingAddress });

      // 3. Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "E-Handicrafts",
        description: "Authentic Indian Handicrafts",
        image:
          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100",
        order_id: data.razorpayOrder.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: shippingAddress?.phone || "",
        },
        notes: {
          address: `${shippingAddress?.street}, ${shippingAddress?.city}`,
        },
        theme: { color: "#1B4D5C" },
        handler: async (response) => {
          try {
            // 4. Verify on backend and place order
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress,
            });
            toast.success("Payment successful! Order placed 🎉");
            if (onSuccess) onSuccess(verifyRes.data.order);
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed",
            );
            if (onFailure) onFailure(err);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            if (onFailure) onFailure(new Error("Payment cancelled"));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        if (onFailure) onFailure(response.error);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading };
}

// import { useState } from "react";

// export function useRazorpay() {
//   const [loading, setLoading] = useState(false);

//   const pay = async ({ amount, shippingAddress, onSuccess }) => {
//     setLoading(true);

//     try {
//       // ⏳ simulate payment delay (like processing gateway)
//       await new Promise((res) => setTimeout(res, 1500));

//       // 🎯 fake payment response
//       const fakePaymentResponse = {
//         payment_id: "pay_" + Date.now(),
//         order_id: "order_" + Date.now(),
//         status: "success",
//       };

//       // 🎉 simulate success
//       const fakeOrder = {
//         _id: "ord_" + Date.now(),
//         paymentStatus: "Paid",
//         paymentMethod: "Simulated",
//         amount,
//         shippingAddress,
//         paymentDetails: fakePaymentResponse,
//       };

//       onSuccess(fakeOrder);
//     } catch (err) {
//       console.log("Payment failed (simulated)", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { pay, loading };
// }
