import PaymentList from '@/components/payments/PaymentList';

export const metadata = {
  title: 'Payments | Qbit Accounting',
  description: 'Manage customer payments',
};

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>
      <PaymentList />
    </div>
  );
} 