import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import SellerSidebar from '../../components/seller/SellerSidebar';
import { createProduct, updateProduct, getProduct } from '../../services/api';
import toast from 'react-hot-toast';
import './ProductForm.css';

const CATS = ['Wood Crafts','Pottery','Jewellery','Decor','Textile','Other'];

export default function ProductForm() {
  const { id } = useParams(); const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(isEdit);
  const [imgFiles, setImgFiles] = useState([]); const [imgPreviews, setImgPreviews] = useState([]);
  const [form, setForm] = useState({ name:'', description:'', category:'Wood Crafts', price:'', quantity:'', material:'', handmadeDetails:'', isHandmade:true, tags:'' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id).then(({ data }) => {
      const p = data.product;
      setForm({ name:p.name, description:p.description, category:p.category, price:p.price, quantity:p.quantity, material:p.material||'', handmadeDetails:p.handmadeDetails||'', isHandmade:p.isHandmade, tags:p.tags?.join(', ')||'' });
      setImgPreviews(p.images || []);
    }).finally(() => setFetching(false));
  }, [id]);

  const handleImgs = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImgFiles(files); setImgPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Min 3 characters';
    if (!form.description || form.description.length < 10) e.description = 'Min 10 characters';
    if (!form.price || form.price <= 0) e.price = 'Valid price required';
    if (form.quantity === '' || form.quantity < 0) e.quantity = 'Valid quantity required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imgFiles.forEach(f => fd.append('images', f));
      if (isEdit) { await updateProduct(id, fd); toast.success('Product updated!'); }
      else { await createProduct(fd); toast.success('Product added!'); }
      navigate('/seller/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const f = (k, v) => setForm({ ...form, [k]: v });

  if (fetching) return <div className="dashboard-layout"><SellerSidebar /><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <div className="page-hdr">
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/seller/products')} style={{ marginBottom: 8 }}><FiArrowLeft /> Back</button>
            <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pf-card" style={{ marginBottom: 16 }}>
            <div className="pf-section">
              <h3>Basic Information</h3>
              <div className="form-group"><label>Product Name *</label><input className={`form-control ${errors.name?'error':''}`} placeholder="e.g. Hand-carved Wooden Elephant" value={form.name} onChange={e => f('name', e.target.value)} />{errors.name&&<span className="error-msg">{errors.name}</span>}</div>
              <div className="form-group"><label>Description *</label><textarea className={`form-control ${errors.description?'error':''}`} rows={4} placeholder="Describe your product in detail…" value={form.description} onChange={e => f('description', e.target.value)} />{errors.description&&<span className="error-msg">{errors.description}</span>}</div>
              <div className="form-row-2">
                <div className="form-group"><label>Category *</label><select className="form-control" value={form.category} onChange={e => f('category', e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Tags (comma separated)</label><input className="form-control" placeholder="wood, elephant, decor" value={form.tags} onChange={e => f('tags', e.target.value)} /></div>
              </div>
            </div>

            <div className="pf-section">
              <h3>Pricing & Stock</h3>
              <div className="form-row-2">
                <div className="form-group"><label>Price (₹) *</label><input type="number" className={`form-control ${errors.price?'error':''}`} placeholder="0" min="0" value={form.price} onChange={e => f('price', e.target.value)} />{errors.price&&<span className="error-msg">{errors.price}</span>}</div>
                <div className="form-group"><label>Stock Quantity *</label><input type="number" className={`form-control ${errors.quantity?'error':''}`} placeholder="0" min="0" value={form.quantity} onChange={e => f('quantity', e.target.value)} />{errors.quantity&&<span className="error-msg">{errors.quantity}</span>}</div>
              </div>
            </div>

            <div className="pf-section">
              <h3>Craft Details</h3>
              <div className="form-row-2">
                <div className="form-group"><label>Material</label><input className="form-control" placeholder="e.g. Sheesham wood, terracotta" value={form.material} onChange={e => f('material', e.target.value)} /></div>
                <div className="form-group"><label>Handmade Details</label><input className="form-control" placeholder="Craft technique, region" value={form.handmadeDetails} onChange={e => f('handmadeDetails', e.target.value)} /></div>
              </div>
              <label className="check-label"><input type="checkbox" checked={form.isHandmade} onChange={e => f('isHandmade', e.target.checked)} /> This product is handmade</label>
            </div>

            <div className="pf-section">
              <h3>Product Images (max 5)</h3>
              <div className="img-upload-zone" onClick={() => document.getElementById('img-input').click()}>
                <FiUpload />
                <p>Click to upload images</p>
                <small>JPG, PNG, WEBP up to 5MB each</small>
                <input id="img-input" type="file" accept="image/*" multiple hidden onChange={handleImgs} />
              </div>
              {imgPreviews.length > 0 && (
                <div className="img-previews">
                  {imgPreviews.map((src, i) => (
                    <div key={i} className="img-preview">
                      <img src={src} alt={`Preview ${i+1}`} />
                      <button type="button" className="img-preview-del" onClick={() => { setImgPreviews(p => p.filter((_,j) => j!==i)); setImgFiles(f => f.filter((_,j) => j!==i)); }}><FiX /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pf-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/seller/products')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
