'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/format';
import { Invoice } from '@qbit/shared-types';
import { useReactToPrint } from 'react-to-print';

interface InvoicePrintProps {
  invoice: Invoice;
  companyInfo?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
    logo?: string;
  };
  customerInfo?: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
}

export default function InvoicePrint({ 
  invoice, 
  companyInfo = {
    name: 'Qbit Accounting',
    address: '123 Accounting Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '(555) 123-4567',
    email: 'billing@qbitaccounting.com',
    website: 'www.qbitaccounting.com',
    taxId: '12-3456789',
  },
  customerInfo
}: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${invoice.invoiceNumber}`,
  });

  return (
    <div>
      <Button 
        variant="outline" 
        onClick={handlePrint}
        className="print:hidden mb-4"
      >
        Print Invoice
      </Button>
      
      <div ref={printRef} className="p-8 max-w-4xl mx-auto bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
            <div className="text-gray-500">
              <p>{companyInfo.address}</p>
              <p>{companyInfo.city}, {companyInfo.state} {companyInfo.zipCode}</p>
              <p>Phone: {companyInfo.phone}</p>
              <p>Email: {companyInfo.email}</p>
              {companyInfo.website && <p>Web: {companyInfo.website}</p>}
              {companyInfo.taxId && <p>Tax ID: {companyInfo.taxId}</p>}
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
            <div className="text-gray-600">
              <p><span className="font-bold">Invoice #:</span> {invoice.invoiceNumber}</p>
              <p><span className="font-bold">Date:</span> {formatDate(invoice.invoiceDate)}</p>
              <p><span className="font-bold">Due Date:</span> {formatDate(invoice.dueDate)}</p>
              {invoice.customerReference && (
                <p><span className="font-bold">Reference:</span> {invoice.customerReference}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-600 mb-2">Bill To:</h3>
          {customerInfo ? (
            <div>
              <p className="font-bold">{customerInfo.name}</p>
              {customerInfo.address && <p>{customerInfo.address}</p>}
              {(customerInfo.city || customerInfo.state || customerInfo.zipCode) && (
                <p>
                  {customerInfo.city && `${customerInfo.city}, `}
                  {customerInfo.state && `${customerInfo.state} `}
                  {customerInfo.zipCode}
                </p>
              )}
              {customerInfo.country && <p>{customerInfo.country}</p>}
              {customerInfo.phone && <p>Phone: {customerInfo.phone}</p>}
              {customerInfo.email && <p>Email: {customerInfo.email}</p>}
            </div>
          ) : (
            <p className="italic text-gray-500">Customer information not available</p>
          )}
        </div>
        
        {/* Invoice Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-right">Quantity</th>
              <th className="py-2 text-right">Unit Price</th>
              {invoice.items?.some(item => item.discountPercentage) && (
                <th className="py-2 text-right">Discount</th>
              )}
              {invoice.items?.some(item => item.taxPercentage) && (
                <th className="py-2 text-right">Tax</th>
              )}
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.map((item, index) => {
              const lineTotal = item.quantity * item.unitPrice;
              const discountAmount = item.discountPercentage 
                ? lineTotal * (item.discountPercentage / 100) 
                : 0;
              const netAmount = lineTotal - discountAmount;
              
              return (
                <tr key={item.id || index} className="border-b border-gray-200">
                  <td className="py-2">
                    {item.description}
                    {item.itemCode && (
                      <div className="text-xs text-gray-500">Item Code: {item.itemCode}</div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-gray-500">{item.notes}</div>
                    )}
                  </td>
                  <td className="py-2 text-right">{item.quantity.toFixed(2)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  {invoice.items?.some(item => item.discountPercentage) && (
                    <td className="py-2 text-right">
                      {item.discountPercentage ? `${item.discountPercentage}%` : '-'}
                    </td>
                  )}
                  {invoice.items?.some(item => item.taxPercentage) && (
                    <td className="py-2 text-right">
                      {item.taxPercentage ? `${item.taxPercentage}%` : '-'}
                    </td>
                  )}
                  <td className="py-2 text-right">{formatCurrency(netAmount)}</td>
                </tr>
              );
            })}
            
            {/* Totals */}
            <tr>
              <td colSpan={6} className="py-2">
                <div className="flex justify-end">
                  <div className="w-64 space-y-1 mt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discountAmount && invoice.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                    {invoice.taxAmount && invoice.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(invoice.taxAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 my-1"></div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    {invoice.amountPaid > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span>{formatCurrency(invoice.amountPaid)}</span>
                        </div>
                        <div className="border-t border-gray-300 my-1"></div>
                        <div className="flex justify-between font-bold">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(invoice.balanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-600 mb-2">Notes</h3>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
        
        {/* Terms */}
        {invoice.terms && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-600 mb-2">Terms and Conditions</h3>
            <p className="whitespace-pre-line">{invoice.terms}</p>
          </div>
        )}
        
        {/* Payment Information */}
        <div className="mt-8 text-center text-gray-600">
          <p>Thank you for your business!</p>
          {invoice.status === 'PAID' ? (
            <div className="text-green-700 font-bold mt-2">PAID</div>
          ) : (
            <p className="mt-2">Please remit payment by {formatDate(invoice.dueDate)}</p>
          )}
        </div>
      </div>
    </div>
  );
} 