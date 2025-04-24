import InvoiceList from '@/components/invoices/InvoiceList';

export const metadata = {
  title: 'Invoices | Qbit Accounting',
  description: 'Manage your customer invoices',
};

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Invoices</h1>
      <InvoiceList />
    </div>
  );
} 