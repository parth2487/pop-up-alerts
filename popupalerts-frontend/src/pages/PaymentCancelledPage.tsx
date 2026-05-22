import { Link } from 'react-router-dom';

export default function PaymentCancelledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
      <p className="text-lg text-gray-700 mb-8">
        Your payment process was cancelled. You can try again from the pricing page.
      </p>
      <Link 
        to="/pricing" 
        className="px-6 py-3 font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
      >
        Back to Pricing
      </Link>
    </div>
  );
}