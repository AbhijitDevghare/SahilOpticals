import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Glasses, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/Table';
import {
  createProduct,
  deleteProduct,
  getProductCategories,
  getProducts,
  updateProduct,
} from '../services/product.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const EMPTY_FORM = {
  name: '',
  category: 'Frames',
  price: '',
  description: '',
};

export default function ProductsPage() {
  const toast = useToast();
  const outletContext = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(PRODUCT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveSearch = (search || outletContext.globalSearch || '').trim();

  useEffect(() => {
    getProductCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({
        search: effectiveSearch,
        category: categoryFilter,
      });
      setProducts(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load product catalogue.'));
    } finally {
      setLoading(false);
    }
  }, [effectiveSearch, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      category: prod.category,
      price: String(prod.price),
      description: prod.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    const numericPrice = Number(form.price);
    if (form.price === '' || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setFormError('Enter a valid non-negative price.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: numericPrice,
        description: form.description.trim(),
      };
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        toast.success('Product updated successfully.');
      } else {
        await createProduct(payload);
        toast.success('Product added to catalogue.');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Unable to save product.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete._id);
      toast.success(`Removed "${productToDelete.name}" from catalogue.`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Unable to delete product.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalogue"
        subtitle="Manage optical frames, lenses, eyeglasses, sunglasses, contact lenses, and accessories."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
            Add Product
          </Button>
        }
      />

      {/* Search & Category Pills */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search products by name, category, or description..."
                leftIcon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500 tabular-nums shrink-0">
              Showing <strong className="text-slate-900">{products.length}</strong> catalogue{' '}
              {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150',
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center justify-between gap-3 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={fetchProducts}>
            Retry
          </Button>
        </div>
      )}

      {/* Product Listing Table */}
      <Card>
        {loading ? (
          <LoadingState message="Loading product catalogue..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Glasses}
            title="No catalogue products found"
            description="Add optical products to select them quickly while creating bills."
            action={
              <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
                Add Product
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden sm:block">
              <Table>
                <TableHead>
                  <TableRow hover={false}>
                    <TableHeaderCell>Product Name</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell align="right">Rate / Price</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((prod) => (
                    <TableRow key={prod._id}>
                      <TableCell className="font-semibold text-slate-900">
                        {prod.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{prod.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500 max-w-md truncate" title={prod.description}>
                          {prod.description || '-'}
                        </p>
                      </TableCell>
                      <TableCell align="right" className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(prod.price)}
                      </TableCell>
                      <TableCell align="right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            title="Edit Product"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            title="Delete Product"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden divide-y divide-slate-100">
              {products.map((prod) => (
                <div key={prod._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{prod.name}</p>
                      <div className="mt-1">
                        <Badge variant="info">{prod.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(prod.price)}
                    </p>
                  </div>
                  {prod.description && (
                    <p className="text-xs text-slate-500">{prod.description}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <Button variant="ghost" size="sm" leftIcon={Pencil} onClick={() => openEditModal(prod)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => setProductToDelete(prod)}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description="Products appear in the New Bill catalogue picker for quick selection."
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700">
              {formError}
            </div>
          )}
          <Input
            label="Product Name *"
            placeholder="e.g. Ray-Ban Aviator Metal Frame"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              options={categories}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            />
            <Input
              label="Standard Price (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <Textarea
            label="Description"
            rows={3}
            placeholder="Frame finish, lens coating, brand or package details"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Product"
        message={
          productToDelete
            ? `Remove "${productToDelete.name}" from the product catalogue? Past bills containing this item will not be affected.`
            : ''
        }
        confirmLabel="Delete Product"
      />
    </div>
  );
}
