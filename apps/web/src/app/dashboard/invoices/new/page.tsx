import InvoiceForm from '@/components/invoices/InvoiceForm';

export const metadata = {
  title: 'Create Invoice | Qbit Accounting',
  description: 'Create a new invoice',
};

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Invoice</h1>
      <InvoiceForm />
    </div>
  );
} 