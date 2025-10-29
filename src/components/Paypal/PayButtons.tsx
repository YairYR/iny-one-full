import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { LoadingSpinner } from "@/components/Spinner";
import { PayPalButtonCreateOrder, PayPalButtonOnApprove } from "@paypal/paypal-js";

interface Props {
  planId: string;
}

export default function PayButtons({ planId }: Props) {
  const [state] = usePayPalScriptReducer();
  const { isPending } = state;

  const createOrder: PayPalButtonCreateOrder = async () => {
    return fetch("/api/checkout/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            id: planId,
            quantity: 1,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((order) => order.id);
  }

  const onApprove: PayPalButtonOnApprove = async (data) => {
    return fetch("/api/checkout/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: data.orderID
      })
    })
      .then((response) => response.json())
      .then((orderData) => {
        const name = orderData.order.payer.name.given_name;
        alert(`Transaction completed by ${name}`);
      });
  }

  return (
    <>
      {isPending
        ? <LoadingSpinner />
        : null}
      <PayPalButtons
        style={{ layout: 'vertical', color: 'silver' }}
        createOrder={createOrder}
        onApprove={onApprove}
        appSwitchWhenAvailable={false}
      />
    </>
  )
}