import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { markOrderPaid } from "../../services/api";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = params.get("orderId");

    const update = async () => {
      if (!orderId) return;

      const res = await markOrderPaid({ orderId });

      if (res.data.success) {
        toast.success("Payment Successful 🎉");
        navigate(`/orders/${orderId}`);
      } else {
        toast.error("Payment update failed");
      }
    };

    update();
  }, []);

  return <h2 style={{ textAlign: "center" }}>Processing Payment...</h2>;
}
