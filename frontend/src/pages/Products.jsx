import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const { authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    const res = await authFetch('/api/products?search=' + encodeURIComponent(search));
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async () => {
    await authFetch('/api/products/' + deleteTarget.id, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchProducts();
  };

  const handleAdjust = async (id, delta) => {
    await authFetch('/api/products/' + id + '/adjust', {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    });
    fetchProducts();
  };

  const openAdd = () => { setEditProduct(null); setShowForm(true); };
  const openEdit = (p) => { setEditProduct(p); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditProduct(null); };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your inventory items</p>
      </div>
      <div className="toolbar">
        <input type="text" className="search-box" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add product</button>
      </div>
      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={() => { closeForm(); fetchProducts(); }}
          onCancel={closeForm}
          authFetch={authFetch}
        />
      )}
      {deleteTarget && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h4>Delete product?</h4>
            <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.sku})?</p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>SKU</th><th>Quantity</th>
              <th>Status</th><th>Sell price</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const low = p.quantityOnHand <= (p.lowStockThreshold ?? 5);
              return (
                <tr key={p.id}>
                  <td className="td-name">{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => handleAdjust(p.id, -1)}>−</button>
                      <span className="qty-val">{p.quantityOnHand}</span>
                      <button className="qty-btn" onClick={() => handleAdjust(p.id, 1)}>+</button>
                    </div>
                  </td>
                  <td><span className={'badge ' + (low ? 'badge-danger' : 'badge-success')}>{low ? '⚠ Low stock' : '✓ OK'}</span></td>
                  <td>{p.sellingPrice != null ? '₹' + parseFloat(p.sellingPrice).toFixed(2) : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <div className="empty-state">No products found. Add your first one!</div>}
      </div>
    </div>
  );
}