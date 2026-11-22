import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Eye,
  Glasses,
  CreditCard,
  ReceiptText,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import LoadingState from '../components/ui/LoadingState';
import {
  calculateBill,
  createBill,
  getNextBillNumber,
} from '../services/bill.service';
import {
  getCustomers,
  lookupCustomerByMobile,
} from '../services/customer.service';
import { getProductCategories, getProducts } from '../services/product.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import {
  PRODUCT_CATEGORIES,
  PAYMENT_MODES,
  LENS_TYPES,
  GST_RATES,
  PAYMENT_STATUS_VARIANTS,
} from '../utils/constants';
import {
  formatCurrency,
  formatExactCurrency,
  toLocalDateInputValue,
} from '../utils/formatters';

const createEmptyItem = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product: '',
  name: '',
  category: 'Frames',
  quantity: 1,
  rate: '',
});

const EMPTY_PRESCRIPTION = {
  rightEye: { sph: '', cyl: '', axis: '', add: '' },
  leftEye: { sph: '', cyl: '', axis: '', add: '' },
  pdDistance: '',
  pdNear: '',
  lensType: '',
  remarks: '',
};

const EMPTY_SUMMARY = {
  items: [],
  subtotal: 0,
  discountType: 'fixed',
  discountValue: 0,
  discount: 0,
  taxableAmount: 0,
  gstRate: 12,
  GST: 0,
  cgst: 0,
  sgst: 0,
  grandTotal: 0,
  advance: 0,
  balance: 0,
  paymentStatus: 'Pending',
};

export default function NewBillPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const prefillCustomer = location.state?.customer || null;

  // Initial API metadata
  const [initializing, setInitializing] = useState(true);
  const [nextBillNumber, setNextBillNumber] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(PRODUCT_CATEGORIES);

  // Section A: Customer Details
  const [customerName, setCustomerName] = useState(prefillCustomer?.name || '');
  const [customerMobile, setCustomerMobile] = useState(prefillCustomer?.mobile || '');
  const [customerAddress, setCustomerAddress] = useState(prefillCustomer?.address || '');
  const [matchedCustomer, setMatchedCustomer] = useState(prefillCustomer);
  const [latestPrescription, setLatestPrescription] = useState(null);
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [mobileSuggestionsOpen, setMobileSuggestionsOpen] = useState(false);
  const lastAutofilledCustomerIdRef = useRef(prefillCustomer?._id || null);

  // Section B: Eye Prescription (optional)
  const [includePrescription, setIncludePrescription] = useState(true);
  const [prescription, setPrescription] = useState(EMPTY_PRESCRIPTION);

  // Section C: Product Details
  const [items, setItems] = useState([createEmptyItem()]);

  // Section D: Payment Details
  const [billDate, setBillDate] = useState(() => toLocalDateInputValue());
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState('0');
  const [gstRate, setGstRate] = useState('12');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentBreakdown, setPaymentBreakdown] = useState({ cash: '', upi: '', card: '' });
  const [advance, setAdvance] = useState('');
  const [notes, setNotes] = useState('');

  // Section E: Authoritative Backend Calculation Summary
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load bill number, product catalogue & categories from backend
  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const [billNo, prods, cats] = await Promise.all([
          getNextBillNumber(),
          getProducts(),
          getProductCategories().catch(() => PRODUCT_CATEGORIES),
        ]);
        if (!active) return;
        setNextBillNumber(billNo);
        setProducts(prods);
        if (cats.length > 0) setCategories(cats);

        if (prefillCustomer?.mobile) {
          const lookup = await lookupCustomerByMobile(prefillCustomer.mobile).catch(() => null);
          if (active && lookup?.found) {
            setMatchedCustomer(lookup.customer);
            setLatestPrescription(lookup.latestPrescription || null);
          }
        }
      } catch (err) {
        if (active) {
          toast.error(getApiErrorMessage(err, 'Failed to load billing setup data.'));
        }
      } finally {
        if (active) setInitializing(false);
      }
    };
    loadInitial();
    return () => {
      active = false;
    };
  }, [prefillCustomer?.mobile]);

  // Live Customer Lookup via backend API (debounced)
  useEffect(() => {
    const clean = customerMobile.trim();
    if (clean.length < 3) {
      setMobileSuggestions([]);
      setMatchedCustomer(null);
      setLatestPrescription(null);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const [matches, exactRes] = await Promise.all([
          getCustomers({ mobile: clean }),
          clean.length >= 7 ? lookupCustomerByMobile(clean) : Promise.resolve(null),
        ]);
        if (!active) return;
        setMobileSuggestions(matches.slice(0, 5));

        if (exactRes?.found && exactRes.customer) {
          setMatchedCustomer(exactRes.customer);
          setLatestPrescription(exactRes.latestPrescription || null);
          if (lastAutofilledCustomerIdRef.current !== exactRes.customer._id) {
            setCustomerName(exactRes.customer.name || '');
            setCustomerAddress(exactRes.customer.address || '');
            lastAutofilledCustomerIdRef.current = exactRes.customer._id;
          }
        } else {
          setMatchedCustomer(null);
          setLatestPrescription(null);
          lastAutofilledCustomerIdRef.current = null;
        }
      } catch {
        // Silent fallback on background autocomplete
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerMobile]);

  // Backend Source-of-Truth Calculation Preview (POST /api/bills/calculate)
  useEffect(() => {
    const validItems = items.filter(
      (row) => row.name.trim() !== '' && row.rate !== '' && Number(row.quantity) >= 1
    );

    if (validItems.length === 0) {
      setSummary({ ...EMPTY_SUMMARY, gstRate: Number(gstRate) || 0 });
      setCalcError('');
      setCalculating(false);
      return undefined;
    }

    let active = true;
    setCalculating(true);

    const timer = setTimeout(async () => {
      try {
        const payload = {
          items: validItems.map((row) => ({
            product: row.product || undefined,
            name: row.name.trim(),
            category: row.category || 'Other',
            quantity: Number(row.quantity),
            rate: Number(row.rate),
          })),
          discountType,
          discountValue: discountValue === '' ? 0 : Number(discountValue),
          gstRate: gstRate === '' ? 0 : Number(gstRate),
          advance: advance === '' ? 0 : Number(advance),
          paymentMode,
          ...(paymentMode === 'Mixed' &&
            (paymentBreakdown.cash !== '' ||
              paymentBreakdown.upi !== '' ||
              paymentBreakdown.card !== '') && {
              paymentBreakdown: {
                cash: Number(paymentBreakdown.cash || 0),
                upi: Number(paymentBreakdown.upi || 0),
                card: Number(paymentBreakdown.card || 0),
              },
            }),
        };

        const result = await calculateBill(payload);
        if (active && result) {
          setSummary(result);
          setCalcError('');
        }
      } catch (err) {
        if (active) {
          setCalcError(getApiErrorMessage(err, 'Invalid monetary values.'));
        }
      } finally {
        if (active) setCalculating(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [items, discountType, discountValue, gstRate, advance, paymentMode, paymentBreakdown]);

  const handleSelectSuggestion = async (cust) => {
    setCustomerMobile(cust.mobile);
    setCustomerName(cust.name);
    setCustomerAddress(cust.address || '');
    setMatchedCustomer(cust);
    lastAutofilledCustomerIdRef.current = cust._id;
    setMobileSuggestionsOpen(false);
    try {
      const lookup = await lookupCustomerByMobile(cust.mobile);
      if (lookup?.found) {
        setLatestPrescription(lookup.latestPrescription || null);
      }
    } catch {
      // Ignore secondary Rx lookup error
    }
  };

  const handleLoadLatestRx = () => {
    if (!latestPrescription) return;
    setIncludePrescription(true);
    setPrescription({
      rightEye: {
        sph: latestPrescription.rightEye?.sph || '',
        cyl: latestPrescription.rightEye?.cyl || '',
        axis: latestPrescription.rightEye?.axis || '',
        add: latestPrescription.rightEye?.add || '',
      },
      leftEye: {
        sph: latestPrescription.leftEye?.sph || '',
        cyl: latestPrescription.leftEye?.cyl || '',
        axis: latestPrescription.leftEye?.axis || '',
        add: latestPrescription.leftEye?.add || '',
      },
      pdDistance: latestPrescription.pdDistance || '',
      pdNear: latestPrescription.pdNear || '',
      lensType: latestPrescription.lensType || '',
      remarks: latestPrescription.remarks || '',
    });
    toast.info(`Loaded prescription from ${latestPrescription.fromBillNumber}`);
  };

  const updateEyeField = (eye, field, value) => {
    setPrescription((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value },
    }));
  };

  const handleSelectCatalogueProduct = (rowId, productId) => {
    const selected = products.find((p) => p._id === productId);
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (!selected) return { ...row, product: '' };
        return {
          ...row,
          product: selected._id,
          name: selected.name,
          category: selected.category,
          rate: String(selected.price),
        };
      })
    );
  };

  const handleUpdateItemField = (rowId, field, value) => {
    setItems((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const handleRemoveItem = (rowId) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));
  };

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setMatchedCustomer(null);
    setLatestPrescription(null);
    lastAutofilledCustomerIdRef.current = null;
    setPrescription(EMPTY_PRESCRIPTION);
    setItems([createEmptyItem()]);
    setDiscountType('fixed');
    setDiscountValue('0');
    setGstRate('12');
    setPaymentMode('Cash');
    setPaymentBreakdown({ cash: '', upi: '', card: '' });
    setAdvance('');
    setNotes('');
    setCalcError('');
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim() || !customerMobile.trim()) {
      setSubmitError('Customer name and mobile number are required.');
      return;
    }

    const validItems = items.filter((row) => row.name.trim() !== '');
    if (validItems.length === 0) {
      setSubmitError('Please add at least one product item.');
      return;
    }

    const missingRateItem = validItems.find(
      (row) => row.rate === '' || row.rate === null || row.rate === undefined
    );
    if (missingRateItem) {
      setSubmitError(`Please enter a price for "${missingRateItem.name.trim()}".`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        billDate,
        customer: {
          name: customerName.trim(),
          mobile: customerMobile.trim(),
          address: customerAddress.trim(),
        },
        prescription: includePrescription ? prescription : undefined,
        items: validItems.map((row) => ({
          product: row.product || undefined,
          name: row.name.trim(),
          category: row.category || 'Other',
          quantity: Number(row.quantity),
          rate: Number(row.rate),
        })),
        discountType,
        discountValue: discountValue === '' ? 0 : Number(discountValue),
        gstRate: gstRate === '' ? 0 : Number(gstRate),
        advance: advance === '' ? 0 : Number(advance),
        paymentMode,
        ...(paymentMode === 'Mixed' &&
          (paymentBreakdown.cash !== '' ||
            paymentBreakdown.upi !== '' ||
            paymentBreakdown.card !== '') && {
            paymentBreakdown: {
              cash: Number(paymentBreakdown.cash || 0),
              upi: Number(paymentBreakdown.upi || 0),
              card: Number(paymentBreakdown.card || 0),
            },
          }),
        notes: notes.trim(),
      };

      const createdInvoice = await createBill(payload);
      toast.success(`Bill ${createdInvoice.billNumber} saved successfully.`);
      navigate(`/bills/${createdInvoice._id}`);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to save bill.');
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <LoadingState message="Preparing billing workspace..." />;
  }

  // Map backend-computed line amounts back to rows cleanly
  const validItemsIndexMap = new Map();
  let backendIdx = 0;
  items.forEach((row) => {
    if (row.name.trim() !== '' && row.rate !== '' && Number(row.quantity) >= 1) {
      validItemsIndexMap.set(row.id, summary.items?.[backendIdx]?.amount ?? null);
      backendIdx += 1;
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title="Create New Bill"
        subtitle={`Next Bill No: ${nextBillNumber || 'Auto-generated'} — All totals are calculated and verified on the backend.`}
        actions={
          <Button variant="secondary" leftIcon={RotateCcw} onClick={handleResetForm}>
            Reset Form
          </Button>
        }
      />

      {submitError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Sections A, B, C, D */}
        <div className="xl:col-span-8 space-y-6">
          {/* SECTION A: CUSTOMER DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>A. Customer Details</CardTitle>
                  <CardDescription>
                    Enter mobile number to search and autofill existing MongoDB customer records
                  </CardDescription>
                </div>
              </div>
              {matchedCustomer && (
                <Badge variant="info" dot>
                  Existing Customer Matched
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Mobile Number *"
                    placeholder="e.g. 9822011223"
                    leftIcon={Search}
                    value={customerMobile}
                    onChange={(e) => {
                      setCustomerMobile(e.target.value);
                      setMobileSuggestionsOpen(true);
                    }}
                    onFocus={() => setMobileSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setMobileSuggestionsOpen(false), 180)}
                  />
                  {mobileSuggestionsOpen && mobileSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1 max-h-52 overflow-y-auto">
                      {mobileSuggestions.map((cust) => (
                        <button
                          key={cust._id}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(cust)}
                          className="w-full px-3.5 py-2 text-left hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {cust.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {cust.address || 'No address'}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                            {cust.mobile}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="Customer Name *"
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <Input
                label="Address"
                placeholder="Street, area, city"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* SECTION B: EYE PRESCRIPTION */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>B. Eye Prescription (Optional)</CardTitle>
                  <CardDescription>
                    Right Eye (OD), Left Eye (OS), PD Distance, PD Near & Lens Type
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {latestPrescription && (
                  <Button
                    variant="soft"
                    size="sm"
                    leftIcon={Sparkles}
                    onClick={handleLoadLatestRx}
                  >
                    Load Latest Rx ({latestPrescription.fromBillNumber})
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIncludePrescription((prev) => !prev)}
                >
                  {includePrescription ? 'Hide Rx' : 'Add Rx'}
                </Button>
              </div>
            </CardHeader>

            {includePrescription && (
              <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="px-3.5 py-2.5 text-left font-semibold w-36">Eye</th>
                        <th className="px-3 py-2.5 text-left font-semibold">SPH</th>
                        <th className="px-3 py-2.5 text-left font-semibold">CYL</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Axis</th>
                        <th className="px-3 py-2.5 text-left font-semibold">ADD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { key: 'rightEye', label: 'Right Eye (OD)' },
                        { key: 'leftEye', label: 'Left Eye (OS)' },
                      ].map((row) => (
                        <tr key={row.key}>
                          <td className="px-3.5 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                            {row.label}
                          </td>
                          {['sph', 'cyl', 'axis', 'add'].map((field) => (
                            <td key={field} className="px-2.5 py-2">
                              <input
                                type="text"
                                placeholder={
                                  field === 'axis' ? '0 - 180' : field === 'add' ? '+1.50' : '0.00'
                                }
                                value={prescription[row.key][field]}
                                onChange={(e) => updateEyeField(row.key, field, e.target.value)}
                                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 tabular-nums"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="PD Distance (mm)"
                    placeholder="e.g. 62"
                    value={prescription.pdDistance}
                    onChange={(e) =>
                      setPrescription((p) => ({ ...p, pdDistance: e.target.value }))
                    }
                  />
                  <Input
                    label="PD Near (mm)"
                    placeholder="e.g. 59"
                    value={prescription.pdNear}
                    onChange={(e) =>
                      setPrescription((p) => ({ ...p, pdNear: e.target.value }))
                    }
                  />
                  <Select
                    label="Lens Type"
                    placeholder="Select lens type"
                    options={LENS_TYPES}
                    value={prescription.lensType}
                    onChange={(e) =>
                      setPrescription((p) => ({ ...p, lensType: e.target.value }))
                    }
                  />
                </div>

                <Input
                  label="Optometrist / Prescription Remarks"
                  placeholder="Optional coating or fitting remarks"
                  value={prescription.remarks}
                  onChange={(e) =>
                    setPrescription((p) => ({ ...p, remarks: e.target.value }))
                  }
                />
              </CardContent>
            )}
          </Card>

          {/* SECTION C: PRODUCT DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Glasses className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>C. Product Details</CardTitle>
                  <CardDescription>
                    Select from product catalogue or enter any custom optical item manually
                  </CardDescription>
                </div>
              </div>
              <Button variant="soft" size="sm" leftIcon={Plus} onClick={handleAddItem}>
                Add Item
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {items.map((row, index) => {
                const backendAmount = validItemsIndexMap.get(row.id);

                return (
                  <div
                    key={row.id}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Item #{index + 1}
                        </span>
                        <Badge variant={row.product ? 'info' : 'neutral'}>
                          {row.product ? 'Catalogue' : 'Manual Entry'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {backendAmount !== null && backendAmount !== undefined
                            ? formatCurrency(backendAmount)
                            : '—'}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(row.id)}
                            aria-label="Remove item"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <Select
                      label="Pick from Product Catalogue (Optional)"
                      value={row.product}
                      onChange={(e) => handleSelectCatalogueProduct(row.id, e.target.value)}
                    >
                      <option value="">— Manual Item Entry —</option>
                      {products.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.name} ({prod.category}) — {formatCurrency(prod.price)}
                        </option>
                      ))}
                    </Select>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <Input
                          label="Product Name *"
                          placeholder="Enter frame, lens or service"
                          value={row.name}
                          onChange={(e) => handleUpdateItemField(row.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Select
                          label="Category"
                          options={categories}
                          value={row.category}
                          onChange={(e) =>
                            handleUpdateItemField(row.id, 'category', e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Qty *"
                          type="number"
                          min="1"
                          step="1"
                          value={row.quantity}
                          onChange={(e) =>
                            handleUpdateItemField(row.id, 'quantity', e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Price (₹) *"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={row.rate}
                          onChange={(e) => handleUpdateItemField(row.id, 'rate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="secondary"
                size="sm"
                leftIcon={Plus}
                onClick={handleAddItem}
                className="w-full sm:w-auto"
              >
                Add Another Product
              </Button>
            </CardContent>
          </Card>

          {/* SECTION D: PAYMENT DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>D. Payment Details</CardTitle>
                  <CardDescription>
                    Discount, GST rate, payment mode and advance collected
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Bill Date"
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                />

                <Select
                  label="Discount Type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  options={[
                    { value: 'fixed', label: 'Fixed Amount (₹)' },
                    { value: 'percentage', label: 'Percentage (%)' },
                  ]}
                />

                <Input
                  label={discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="GST Rate (%)"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                >
                  {GST_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate === 0 ? '0% GST (Nil)' : `${rate}% GST (${rate / 2}% + ${rate / 2}%)`}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Payment Mode"
                  options={PAYMENT_MODES}
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />

                <Input
                  label="Advance Paid (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setAdvance(String(summary.grandTotal || 0))}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-0.5 rounded bg-blue-50"
                    >
                      Full
                    </button>
                  }
                />
              </div>

              {paymentMode === 'Mixed' && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-700">
                    Mixed Payment Split (Optional breakdown matching Advance Paid)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Cash (₹)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={paymentBreakdown.cash}
                      onChange={(e) =>
                        setPaymentBreakdown((p) => ({ ...p, cash: e.target.value }))
                      }
                    />
                    <Input
                      label="UPI (₹)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={paymentBreakdown.upi}
                      onChange={(e) =>
                        setPaymentBreakdown((p) => ({ ...p, upi: e.target.value }))
                      }
                    />
                    <Input
                      label="Card (₹)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={paymentBreakdown.card}
                      onChange={(e) =>
                        setPaymentBreakdown((p) => ({ ...p, card: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              <Textarea
                label="Bill Notes"
                rows={2}
                placeholder="Any special lens care notes or invoice remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Columns: SECTION E — BACKEND-CALCULATED BILL SUMMARY */}
        <div className="xl:col-span-4 xl:sticky xl:top-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                  <ReceiptText className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>E. Bill Summary</CardTitle>
                  <CardDescription>{nextBillNumber || 'Backend Verified'}</CardDescription>
                </div>
              </div>
              {calculating ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <Badge
                  variant={PAYMENT_STATUS_VARIANTS[summary.paymentStatus] || 'neutral'}
                  dot
                >
                  {summary.paymentStatus}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {calcError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{calcError}</span>
                </div>
              )}

              <div className="space-y-2.5 text-sm tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatExactCurrency(summary.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>
                    Discount
                    {summary.discountType === 'percentage' && summary.discountValue > 0
                      ? ` (${summary.discountValue}%)`
                      : ''}
                  </span>
                  <span className="font-medium text-slate-900">
                    - {formatExactCurrency(summary.discount)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount</span>
                  <span className="font-medium text-slate-900">
                    {formatExactCurrency(summary.taxableAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>GST ({summary.gstRate}%)</span>
                  <span className="font-medium text-slate-900">
                    {formatExactCurrency(summary.GST)}
                  </span>
                </div>

                {Number(summary.GST || 0) > 0 && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>CGST + SGST</span>
                    <span>
                      {formatExactCurrency(summary.cgst)} + {formatExactCurrency(summary.sgst)}
                    </span>
                  </div>
                )}

                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-bold text-blue-700">
                    {formatExactCurrency(summary.grandTotal)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Advance Paid ({paymentMode})</span>
                    <span className="font-semibold text-slate-900">
                      {formatExactCurrency(summary.advance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Balance Due</span>
                    <span
                      className={[
                        'text-base font-bold',
                        summary.balance > 0 ? 'text-rose-600' : 'text-emerald-700',
                      ].join(' ')}
                    >
                      {formatExactCurrency(summary.balance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 space-y-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  disabled={Boolean(calcError)}
                  leftIcon={CheckCircle2}
                >
                  Save Bill & View Invoice
                </Button>
                <p className="text-[11px] text-slate-400 text-center">
                  Persists bill, customer & prescription in MongoDB and opens printable invoice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
