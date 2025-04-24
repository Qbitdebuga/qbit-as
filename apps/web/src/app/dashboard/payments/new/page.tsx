import PaymentForm from '@/components/payments/PaymentForm';

export const metadata = {
  title: 'Record Payment | Qbit Accounting',
  description: 'Record a new payment',
};

export default function NewPaymentPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Record New Payment</h1>
      <PaymentForm />
    </div>
  );
} 