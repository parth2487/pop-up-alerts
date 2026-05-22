import { Link } from 'react-router-dom';

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-8">
        Thank you for subscribing. Your account has been upgraded.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Go to My Dashboard
      </Link>
    </div>
  );
}