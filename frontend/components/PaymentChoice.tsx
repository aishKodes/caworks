import Script from "next/script";
import { ManualPaymentUpload } from "@/components/ManualPaymentUpload";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";

export function PaymentChoice({ requestId, amount = 499 }: { requestId: string; amount?: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <RazorpayCheckout requestId={requestId} amount={amount} />
      <ManualPaymentUpload requestId={requestId} amount={amount} />
    </div>
  );
}
