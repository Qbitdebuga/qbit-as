import PaymentForm from '@/components/payments/PaymentForm';

export const metadata = {
  title: 'Record Vendor Payment | Qbit Accounting',
  description: 'Record a new vendor payment',
};

export default function NewPaymentPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Record Vendor Payment</h1>
      <PaymentForm />
    </div>
  );
}
