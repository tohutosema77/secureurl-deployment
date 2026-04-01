import React from "react";
import axios from "axios";
import { serverUrl } from "../../helpers/Constants";


const PaymentButton: React.FC = () => {

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      // // 1️⃣ Create order
      // const { data: order } = await axios.post(
      //   `${serverUrl}/payment/create-order`,
      //   {},
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // 1️⃣ Create order
      const { data } = await axios.post(
        `${serverUrl}/payment/create-order`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2️⃣ Razorpay options
      const options = {
        // key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        key:data.key, //fixed
        amount: data.amount,
        currency: data.currency,
        name: "SecureURL",
        description: "Premium Upgrade",
        order_id: data.order.id,

        handler: async function (response: any) {
          const verifyRes = await axios.post(
            `${serverUrl}/payment/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (verifyRes.data.success) {
            alert("🎉 You are now Premium!");
          } else {
            alert("Payment failed ❌");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment error");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
    >
      Upgrade to Premium 🚀
    </button>
  );
};

export default PaymentButton;