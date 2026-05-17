import { useState } from 'react';

export default function ProductForm({ product, onSave, onCancel, authFetch }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    quantityOnHand: product?.quantityOnHand ?? 0,
    costPrice: product?.costPrice ?? '',
    sellingPrice: product?.sellingPrice ?? '',
    lowStockThreshold: product?.lowStockThreshold ?? '',
  });
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.sku.trim()) { setError('SKU is required'); return; }

    const url = product ? '/api/products/' + product.id : '/api/products';
    const method = product ? 'PUT' : 'POST';

    const res = await authFetch(url, {
      method,
      body: JSON.stringify({
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        description: form.description || null,
        quantityOnHand: parseInt(form.quantityOnHand) || 0,
        costPrice: form.costPrice !== '' ? parseFloat(form.costPrice) : null,
        sellingPrice: form.sellingPrice !== '' ? parseFloat(form.sellingPrice) : null,
        lowStockThreshold: form.lowStockThreshold !== '' ? parseInt(form.lowStockThreshold) : null,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    onSave();
  };

  return (
    <div className="card product-form">
      <h3>{product ? 'Edit product' : 'Add product'}</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Blue T-Shirt" />
          </div>
          <div className="form-group">
            <label>SKU *</label>
            <input value={form.sku} onChange={set('sku')} placeholder="e.g. BTS-001" />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={set('description')} placeholder="Optional description..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Quantity on hand</label>
            <input type="number" value={form.quantityOnHand} onChange={set('quantityOnHand')} min="0" />
          </div>
          <div className="form-group">
            <label>Low stock threshold</label>
            <input type="number" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} placeholder="Use global default" min="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Cost price (₹)</label>
            <input type="number" value={form.costPrice} onChange={set('costPrice')} placeholder="Optional" min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label>Selling price (₹)</label>
            <input type="number" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="Optional" min="0" step="0.01" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{product ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </div>
  );
}