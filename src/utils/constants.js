import {
  LayoutDashboard,
  FilePlus2,
  ReceiptText,
  Users,
  Glasses,
  BarChart3,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview of optical sales, bills & pending dues',
  },
  {
    key: 'billing',
    label: 'New Bill',
    path: '/billing',
    icon: FilePlus2,
    description: 'Create an optical tax invoice with eye prescription',
  },
  {
    key: 'bills',
    label: 'All Bills',
    path: '/bills',
    icon: ReceiptText,
    description: 'Search, filter, view, print & manage customer bills',
  },
  {
    key: 'customers',
    label: 'Customers',
    path: '/customers',
    icon: Users,
    description: 'Customer directory & complete billing history',
  },
  {
    key: 'products',
    label: 'Products',
    path: '/products',
    icon: Glasses,
    description: 'Frames, lenses, sunglasses & optical catalogue',
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    description: 'Daily & monthly sales and payment mode summaries',
  },
  {
    key: 'settings',
    label: 'Shop Settings',
    path: '/settings',
    icon: Settings,
    description: 'Sahil Optical profile, GSTIN & invoice details',
  },
];

export const PRODUCT_CATEGORIES = [
  'Eyeglasses',
  'Frames',
  'Lenses',
  'Sunglasses',
  'Contact Lenses',
  'Accessories',
  'Other',
];

export const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Mixed'];

export const LENS_TYPES = [
  'Single Vision',
  'Bifocal',
  'Progressive',
  'Zero Power / Blue Cut',
  'Contact Lens',
  'Reading',
  'Photochromic',
];

export const GST_RATES = [0, 5, 12, 18];

export const PAYMENT_STATUS_VARIANTS = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'danger',
};
