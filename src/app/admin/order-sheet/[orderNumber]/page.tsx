'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface OrderSheetColor {
  bgClass: string;
  bgHex: string;
  label: string;
}

interface OrderData {
  orderNumber: string;
  orderNumberRaw: number;
  createdAt: string;
  status: {
    fulfillment: string;
    financial: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  delivery: {
    type: 'house' | 'boat' | 'unknown';
    date: string | null;
    time: string | null;
    address: {
      address1: string;
      address2: string;
      city: string;
      province: string;
      zip: string;
      full: string;
    } | null;
  };
  lineItems: Array<{
    name: string;
    packageSize: string;
    quantity: number;
    sku: string | null;
  }>;
  itemCount: number;
  totalPrice: string;
  currency: string;
  note: string | null;
  customAttributes: Array<{ key: string; value: string | null }>;
  sheetColor: OrderSheetColor;
}

export default function OrderSheetPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order #{orderNumber}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Order not found</p>
      </div>
    );
  }

  const deliveryType = order.delivery.type === 'boat' ? 'BOAT DELIVERY' : 'HOUSE DELIVERY';
  const deliveryTypeLabel = order.delivery.type === 'boat' ? 'Boat' : 'House';

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Format timestamp for footer
  const formatTimestamp = (dateStr: string | null, timeStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
      return timeStr ? `${formattedDate} ${timeStr}` : formattedDate;
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          size: letter;
          margin: 0.5in;
        }
      `}</style>

      {/* Print Button - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print Order Sheet
        </button>
      </div>

      {/* Order Sheet */}
      <div
        className="max-w-[8.5in] mx-auto bg-white p-4 font-sans text-sm"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header Row */}
        <table className="w-full border-collapse border-2 border-black mb-0">
          <tbody>
            <tr>
              <td className="border-2 border-black font-bold px-2 py-1 w-16" style={{ backgroundColor: order.sheetColor.bgHex }}>
                Name:
              </td>
              <td className="border-2 border-black px-2 py-1 font-bold text-lg">
                {order.customer.name}
              </td>
              <td className="border-2 border-black font-bold px-2 py-1 w-20" style={{ backgroundColor: order.sheetColor.bgHex }}>
                Phone #:
              </td>
              <td className="border-2 border-black px-2 py-1 font-bold">
                {order.customer.phone}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Delivery Type Banner */}
        <div className="border-l-2 border-r-2 border-black text-center font-bold text-xl py-2" style={{ backgroundColor: order.sheetColor.bgHex }}>
          {deliveryType}
        </div>

        {/* Delivery Details */}
        <table className="w-full border-collapse border-2 border-black mb-0">
          <tbody>
            <tr>
              <td className="border-2 border-black font-bold px-2 py-1 text-xs" style={{ backgroundColor: order.sheetColor.bgHex }}>
                {deliveryTypeLabel} Delivery Date:
              </td>
              <td className="border-2 border-black px-2 py-1 font-bold text-lg" style={{ backgroundColor: order.sheetColor.bgHex }}>
                {formatDate(order.delivery.date)}
              </td>
              <td className="border-2 border-black font-bold px-2 py-1 text-xs" style={{ backgroundColor: order.sheetColor.bgHex }}>
                {deliveryTypeLabel} Delivery Time:
              </td>
              <td className="border-2 border-black px-2 py-1 font-bold text-lg" style={{ backgroundColor: order.sheetColor.bgHex }}>
                {order.delivery.time || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="border-2 border-black font-bold px-2 py-1" style={{ backgroundColor: order.sheetColor.bgHex }}>
                {deliveryTypeLabel} Address:
              </td>
              <td colSpan={3} className="border-2 border-black px-2 py-1 font-bold text-lg">
                {order.delivery.address?.full || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Header */}
        <div className="border-l-2 border-r-2 border-black text-center font-bold text-lg py-2" style={{ backgroundColor: order.sheetColor.bgHex }}>
          {deliveryTypeLabel} Delivery Items:
        </div>

        {/* Line Items Table */}
        <table className="w-full border-collapse border-2 border-black mb-0">
          <thead>
            <tr>
              <th className="border-2 border-black px-2 py-1 text-left underline w-1/3">
                Item Name
              </th>
              <th className="border-2 border-black px-2 py-1 text-center underline w-1/6">
                Pkg Size
              </th>
              <th className="border-2 border-black px-2 py-1 text-center underline w-16">
                Qty
              </th>
              <th className="border-2 border-black px-2 py-1 text-center text-xs w-20">
                In Store?
              </th>
              <th className="border-2 border-black px-2 py-1 text-center text-xs w-20">
                Packed?
              </th>
            </tr>
          </thead>
          <tbody>
            {order.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-1 text-sm">
                  {item.name}
                </td>
                <td className="border border-black px-2 py-1 text-center text-xs whitespace-nowrap">
                  {item.packageSize}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {item.quantity}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {/* Checkbox space */}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {/* Checkbox space */}
                </td>
              </tr>
            ))}
            {/* Add empty rows if fewer than 10 items */}
            {Array.from({ length: Math.max(0, 10 - order.lineItems.length) }).map(
              (_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* Item Count */}
        <table className="w-full border-collapse border-2 border-black mb-0">
          <tbody>
            <tr>
              <td className="border-2 border-black font-bold px-4 py-2 text-lg w-1/2" style={{ backgroundColor: order.sheetColor.bgHex }}>
                # of Items
              </td>
              <td className="border-2 border-black font-bold px-4 py-2 text-lg text-center">
                {order.itemCount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Missing Items & Notes */}
        <div className="border-l-2 border-r-2 border-black text-center font-bold py-2" style={{ backgroundColor: order.sheetColor.bgHex }}>
          Missing Items & Notes
        </div>
        <div className="border-2 border-black min-h-[80px] p-2">
          {order.note && <p className="text-sm">{order.note}</p>}
        </div>

        {/* Timestamp */}
        <div className="mt-4 font-bold text-lg">
          {formatTimestamp(order.delivery.date, order.delivery.time)}
        </div>
      </div>
    </>
  );
}
