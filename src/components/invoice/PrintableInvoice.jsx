import Badge from '../ui/Badge';
import {
  formatCurrency,
  formatDate,
  formatExactCurrency,
  hasPrescriptionDetails,
} from '../../utils/formatters';
import { PAYMENT_STATUS_VARIANTS } from '../../utils/constants';

export default function PrintableInvoice({ bill, shop }) {
  if (!bill) return null;

  const showRx = hasPrescriptionDetails(bill.prescription);
  const od = bill.prescription?.rightEye || {};
  const os = bill.prescription?.leftEye || {};
  const hasMixedSplit =
    bill.paymentMode === 'Mixed' &&
    bill.paymentBreakdown &&
    (bill.paymentBreakdown.cash > 0 ||
      bill.paymentBreakdown.upi > 0 ||
      bill.paymentBreakdown.card > 0);

  const discountLabel =
    bill.discountType === 'percentage' && bill.discountValue > 0
      ? `Discount (${bill.discountValue}%)`
      : 'Discount';

  const halfGstRate = Number(((bill.gstRate || 0) / 2).toFixed(2));

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden print:shadow-none print:border-0 print:rounded-none max-w-4xl mx-auto">
      {/* Header Band */}
      <div className="bg-navy-900 text-white px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {shop?.shopName || 'Sahil Optical'}
          </h1>
          {shop?.tagline && (
            <p className="text-xs text-slate-300">{shop.tagline}</p>
          )}
          <div className="pt-2 space-y-0.5 text-xs text-slate-300">
            {shop?.address && <p>{shop.address}</p>}
            <p>
              {shop?.mobile && <span>Mobile: {shop.mobile}</span>}
              {shop?.mobile && shop?.email && <span className="mx-2 text-slate-500">|</span>}
              {shop?.email && <span>Email: {shop.email}</span>}
            </p>
            {shop?.GSTIN && (
              <p className="font-medium text-slate-200">GSTIN: {shop.GSTIN}</p>
            )}
          </div>
        </div>

        <div className="sm:text-right space-y-1 shrink-0">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Tax Invoice
          </p>
          <p className="text-base font-bold tabular-nums">{bill.billNumber}</p>
          <p className="text-xs text-slate-300">Date: {formatDate(bill.billDate)}</p>
          <div className="pt-1.5">
            <Badge
              variant={PAYMENT_STATUS_VARIANTS[bill.paymentStatus] || 'neutral'}
              dot
            >
              {bill.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Customer & Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Bill To (Customer)
            </p>
            <p className="text-base font-semibold text-slate-900">
              {bill.customer?.name || '-'}
            </p>
            <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
              Mobile: {bill.customer?.mobile || '-'}
            </p>
            {bill.customer?.address && (
              <p className="text-sm text-slate-600 mt-0.5">{bill.customer.address}</p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Payment Information
            </p>
            <p className="text-sm text-slate-700">
              <span className="text-slate-500">Payment Mode: </span>
              <span className="font-semibold text-slate-900">{bill.paymentMode}</span>
            </p>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="text-slate-500">Payment Status: </span>
              <span className="font-semibold text-slate-900">{bill.paymentStatus}</span>
            </p>
            {hasMixedSplit && (
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Cash: {formatCurrency(bill.paymentBreakdown.cash)} · UPI:{' '}
                {formatCurrency(bill.paymentBreakdown.upi)} · Card:{' '}
                {formatCurrency(bill.paymentBreakdown.card)}
              </p>
            )}
          </div>
        </div>

        {/* Eye Prescription Section */}
        {showRx && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2.5">
              Eye Prescription (Rx)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-2.5 text-left font-semibold">Eye</th>
                    <th className="px-4 py-2.5 text-center font-semibold">SPH</th>
                    <th className="px-4 py-2.5 text-center font-semibold">CYL</th>
                    <th className="px-4 py-2.5 text-center font-semibold">Axis</th>
                    <th className="px-4 py-2.5 text-center font-semibold">ADD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">Right Eye (OD)</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{od.sph || '-'}</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{od.cyl || '-'}</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">
                      {od.axis ? `${od.axis}°` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{od.add || '-'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">Left Eye (OS)</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{os.sph || '-'}</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{os.cyl || '-'}</td>
                    <td className="px-4 py-2.5 text-center text-slate-700">
                      {os.axis ? `${os.axis}°` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-700">{os.add || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1.5 rounded-lg bg-slate-50 border border-slate-200/70 px-4 py-2.5 text-xs text-slate-700">
              <span>
                <strong className="text-slate-900">PD Distance:</strong>{' '}
                {bill.prescription?.pdDistance || '-'}
              </span>
              <span>
                <strong className="text-slate-900">PD Near:</strong>{' '}
                {bill.prescription?.pdNear || '-'}
              </span>
              <span>
                <strong className="text-slate-900">Lens Type:</strong>{' '}
                {bill.prescription?.lensType || '-'}
              </span>
              {bill.prescription?.remarks && (
                <span className="w-full text-slate-600 pt-0.5">
                  <strong className="text-slate-900">Remarks:</strong>{' '}
                  {bill.prescription.remarks}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Product Details Table */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2.5">
            Product Details
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3.5 py-2.5 text-center font-semibold w-10">#</th>
                  <th className="px-3.5 py-2.5 text-left font-semibold">Product Name</th>
                  <th className="px-3.5 py-2.5 text-left font-semibold">Category</th>
                  <th className="px-3.5 py-2.5 text-center font-semibold w-16">Qty</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Rate</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(bill.items || []).map((item, idx) => (
                  <tr key={`${item.name}-${idx}`}>
                    <td className="px-3.5 py-3 text-center text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-3.5 py-3 text-slate-600 text-xs">{item.category}</td>
                    <td className="px-3.5 py-3 text-center text-slate-800 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="px-3.5 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                      {formatExactCurrency(item.rate ?? item.price)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatExactCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-6">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 h-full">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Notes
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {bill.notes || `Thank you for shopping at ${shop?.shopName || 'Sahil Optical'}.`}
              </p>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="space-y-2 text-sm tabular-nums">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formatExactCurrency(bill.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>{discountLabel}</span>
                <span className="font-medium text-slate-900">
                  - {formatExactCurrency(bill.discount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Taxable Amount</span>
                <span className="font-medium text-slate-900">
                  {formatExactCurrency(bill.taxableAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>GST ({bill.gstRate || 0}%)</span>
                <span className="font-medium text-slate-900">
                  {formatExactCurrency(bill.GST)}
                </span>
              </div>

              {Number(bill.GST || 0) > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    CGST ({halfGstRate}%) + SGST ({halfGstRate}%)
                  </span>
                  <span>
                    {formatExactCurrency(bill.cgst)} + {formatExactCurrency(bill.sgst)}
                  </span>
                </div>
              )}

              <div className="pt-2.5 mt-2.5 border-t-2 border-slate-900 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Grand Total</span>
                <span>{formatExactCurrency(bill.grandTotal)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700">
                <span className="font-medium">Advance Paid</span>
                <span className="font-semibold text-slate-900">
                  {formatExactCurrency(bill.advance)}
                </span>
              </div>

              <div
                className={[
                  'flex items-center justify-between font-bold text-base',
                  Number(bill.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-700',
                ].join(' ')}
              >
                <span>Balance Due</span>
                <span>{formatExactCurrency(bill.balance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-slate-500">
          <p>This is a computer-generated optical invoice.</p>
          <div className="sm:text-right">
            <div className="w-44 border-t border-slate-400 mb-1.5 sm:ml-auto" />
            <p className="font-semibold text-slate-800">
              For {shop?.shopName || 'Sahil Optical'}
            </p>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </article>
  );
}
