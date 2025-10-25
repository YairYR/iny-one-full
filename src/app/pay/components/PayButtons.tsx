import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { LoadingSpinner } from "@/components/Spinner";
import { PayPalButtonCreateOrder, PayPalButtonOnApprove } from "@paypal/paypal-js";

export default function PayButtons() {
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
            // TODO: Replace with actual product ID
            id: '39314c6e-0178-a8e7-02a2-f5397a8bb8d4',
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