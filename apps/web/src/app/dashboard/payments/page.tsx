import PaymentList from '@/components/payments/PaymentList';

export const metadata = {
  title: 'Vendor Payments | Qbit Accounting',
  description: 'Manage vendor payments for accounts payable',
};

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Vendor Payments</h1>
      <PaymentList />
    </div>
  );
} 