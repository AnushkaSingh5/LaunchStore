'use client';

import { useState, useEffect, useRef } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import { useDashboard } from '@/context/DashboardContext';

export default function ProductsPage() {
  const { products, categories, loading, addProduct, updateProduct, deleteProduct } = useDashboard();
  
  console.log('[LaunchCart - ProductsPage] render values:', { 
    productsCount: products?.length, 
    categoriesCount: categories?.length, 
    loading 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    status: [],
    category: [],
    stock: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    dateRange: 'all'
  });

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    status: 'Published',
    seo_title: '',
    seo_description: '',
    og_title: '',
    og_description: '',
    canonical_url: '',
    spec_dimensions: 'Standard size',
    spec_material: 'Premium sustainably sourced materials',
    spec_finish: 'Satin matte protective coating',
    spec_warranty: '2 Year Manufacturer Warranty',
    spec_origin: 'Designed & Crafted locally',
    shipping_details: 'Secure & Swift Logistics\n\nAll orders are processed and handed over to standard premium courier networks within 24 hours of confirmation.\n\n- Standard Shipping: Delivered in 3-5 business days. Free for this product.\n- Express Shipping: Delivered in 1-2 business days (if selected at checkout).\n- Transit Safety: Fully insured shipments with custom packaging to prevent breakages.',
    return_policy: '7-Day Return & Replacement Policy\n\nWe stand behind the craftsmanship of our products. If you are not completely satisfied, we offer a hassle-free return window.\n\n- Items must be returned in their original packaging and unused condition.\n- Refunds are processed to the original payment source within 3-5 days after warehouse validation.\n- In case of manufacturing defects, contact our support with unboxing images for instant replacements.'
  });

  const imageInputRef = useRef(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      og_title: product.og_title || '',
      og_description: product.og_description || '',
      canonical_url: product.canonical_url || '',
      spec_dimensions: product.spec_dimensions || '',
      spec_material: product.spec_material || '',
      spec_finish: product.spec_finish || '',
      spec_warranty: product.spec_warranty || '',
      spec_origin: product.spec_origin || '',
      shipping_details: product.shipping_details || '',
      return_policy: product.return_policy || ''
    });
    setProductImages(product.images || [product.image]);
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields (Name and Price)');
      return;
    }

    if (productImages.length === 0) {
      alert('Please upload at least 1 product image.');
      return;
    }

    if (productImages.length > 6) {
      alert('You can upload a maximum of 6 images.');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      image: productImages[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      images: productImages,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      og_title: formData.og_title || null,
      og_description: formData.og_description || null,
      canonical_url: formData.canonical_url || null,
      spec_dimensions: formData.spec_dimensions || null,
      spec_material: formData.spec_material || null,
      spec_finish: formData.spec_finish || null,
      spec_warranty: formData.spec_warranty || null,
      spec_origin: formData.spec_origin || null,
      shipping_details: formData.shipping_details || null,
      return_policy: formData.return_policy || null
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      // Find the highest numerical ID among existing products
      const numericalIds = products
        .map(p => parseInt(p.id))
        .filter(id => !isNaN(id));
      
      const nextId = numericalIds.length > 0 
        ? Math.max(...numericalIds) + 1 
        : products.length + 1;

      addProduct({
        ...productData,
        id: nextId.toString(),
        date: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      status: 'Published',
      seo_title: '',
      seo_description: '',
      og_title: '',
      og_description: '',
      canonical_url: '',
      spec_dimensions: 'Standard size',
      spec_material: 'Premium sustainably sourced materials',
      spec_finish: 'Satin matte protective coating',
      spec_warranty: '2 Year Manufacturer Warranty',
      spec_origin: 'Designed & Crafted locally',
      shipping_details: 'Secure & Swift Logistics\n\nAll orders are processed and handed over to standard premium courier networks within 24 hours of confirmation.\n\n- Standard Shipping: Delivered in 3-5 business days. Free for this product.\n- Express Shipping: Delivered in 1-2 business days (if selected at checkout).\n- Transit Safety: Fully insured shipments with custom packaging to prevent breakages.',
      return_policy: '7-Day Return & Replacement Policy\n\nWe stand behind the craftsmanship of our products. If you are not completely satisfied, we offer a hassle-free return window.\n\n- Items must be returned in their original packaging and unused condition.\n- Refunds are processed to the original payment source within 3-5 days after warehouse validation.\n- In case of manufacturing defects, contact our support with unboxing images for instant replacements.'
    });
    setProductImages([]);
  };

  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    const name = String(product.name || '');
    const id = String(product.id || '');
    const status = String(product.status || 'Published');
    const category = String(product.category || 'Uncategorized');
    const price = parseFloat(product.price) || 0;
    const stock = parseInt(product.stock) || 0;

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(status);
    const matchesCategory = filters.category.length === 0 || filters.category.includes(category);
    
    let matchesStock = true;
    if (filters.stock === 'In Stock') matchesStock = stock > 0;
    else if (filters.stock === 'Low Stock (<10)') matchesStock = stock > 0 && stock < 10;
    else if (filters.stock === 'Out of Stock') matchesStock = stock === 0;

    const matchesPrice = (!filters.minPrice || price >= parseFloat(filters.minPrice)) && 
                        (!filters.maxPrice || price <= parseFloat(filters.maxPrice));

    return matchesSearch && matchesStatus && matchesCategory && matchesStock && matchesPrice;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    const aPrice = parseFloat(a.price) || 0;
    const bPrice = parseFloat(b.price) || 0;
    const aName = String(a.name || '');
    const bName = String(b.name || '');
    const aStock = parseInt(a.stock) || 0;
    const bStock = parseInt(b.stock) || 0;

    if (filters.sortBy === 'price_low') return aPrice - bPrice;
    if (filters.sortBy === 'price_high') return bPrice - aPrice;
    if (filters.sortBy === 'az') return aName.localeCompare(bName);
    if (filters.sortBy === 'za') return bName.localeCompare(aName);
    if (filters.sortBy === 'stock') return bStock - aStock;
    return 0;
  });

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      category: [],
      stock: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      dateRange: 'all'
    });
  };

  const activeFilterCount = filters.status.length + filters.category.length + 
                           (filters.stock !== 'All' ? 1 : 0) + 
                           (filters.minPrice || filters.maxPrice ? 1 : 0);

  const handleProductImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (productImages.length >= 6) {
      alert('You can upload a maximum of 6 images.');
      return;
    }
    
    const remainingSlots = 6 - productImages.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`You can only add up to ${remainingSlots} more image(s). Only the first ${remainingSlots} will be uploaded.`);
    }

    filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImages(prev => {
          if (prev.length >= 6) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProductImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsMain = (index) => {
    setProductImages(prev => {
      const newImages = [...prev];
      const [target] = newImages.splice(index, 1);
      newImages.unshift(target);
      return newImages;
    });
  };

  const totalProducts = (products || []).length;
  const publishedCount = (products || []).filter(p => String(p?.status || '').toLowerCase() === 'published').length;
  const draftCount = (products || []).filter(p => String(p?.status || '').toLowerCase() === 'draft').length;
  const outOfStockCount = (products || []).filter(p => (parseInt(p?.stock) || 0) === 0 || String(p?.status || '').toLowerCase() === 'out of stock').length;

  if (loading) return <div style={{ padding: '40px' }}>Loading products...</div>;

  return (
    <div className="products-page">
      <div className="header-row">
        <div className="header-left">
          <h1>Products</h1>
          <p>Manage your inventory, pricing, and product details.</p>
        </div>
        <button className="add-product-btn" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Product
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="summary-info">
            <h3>{totalProducts}</h3>
            <p>Total Products</p>
          </div>
          <div className="summary-spark">
            <svg width="70" height="32" viewBox="0 0 70 32" fill="none"><path d="M0 24 Q 15 5, 35 18 T 70 8" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="summary-info">
            <h3>{publishedCount}</h3>
            <p>Published</p>
          </div>
          <div className="summary-spark">
            <svg width="70" height="32" viewBox="0 0 70 32" fill="none"><path d="M0 20 Q 20 28, 40 12 T 70 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="summary-info">
            <h3>{draftCount}</h3>
            <p>Draft</p>
          </div>
          <div className="summary-spark">
            <svg width="70" height="32" viewBox="0 0 70 32" fill="none"><path d="M0 26 L 20 22 L 40 28 L 70 12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <div className="summary-info">
            <h3>{outOfStockCount}</h3>
            <p>Out of Stock</p>
          </div>
          <div className="summary-spark">
            <svg width="70" height="32" viewBox="0 0 70 32" fill="none"><path d="M0 12 Q 15 5, 35 24 T 70 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className={`filter-btn-toggle ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          <svg className={`chevron ${isFilterOpen ? 'up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

      {(activeFilterCount > 0 || searchQuery) && (
        <div className="active-filters-row">
          <div className="active-chips">
            <span className="results-text">{filteredProducts.length} products found</span>
            {filters.status.map(s => (
              <div key={s} className="filter-chip">
                Status: {s}
                <button onClick={() => toggleFilter('status', s)}>&times;</button>
              </div>
            ))}
            {filters.category.map(c => (
              <div key={c} className="filter-chip">
                Category: {c}
                <button onClick={() => toggleFilter('category', c)}>&times;</button>
              </div>
            ))}
            {filters.stock !== 'All' && (
              <div className="filter-chip">
                Stock: {filters.stock}
                <button onClick={() => handleFilterChange('stock', 'All')}>&times;</button>
              </div>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <div className="filter-chip">
                Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }}>&times;</button>
              </div>
            )}
          </div>
          <button className="clear-all-btn" onClick={resetFilters}>Clear all</button>
        </div>
      )}

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>PRODUCT NAME <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></th>
              <th>CATEGORY <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></th>
              <th>PRICE <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></th>
              <th>STOCK <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></th>
              <th>STATUS <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No products found matching your criteria.</td></tr>
            ) : filteredProducts.map(product => {
              const price = parseFloat(product.price) || 0;
              const stock = parseInt(product.stock) || 0;
              const status = String(product.status || 'Published');
              const category = String(product.category || 'Uncategorized');

              return (
                <tr key={product.id}>
                  <td>{String(product.id || '')}</td>
                  <td>
                    <div className="product-name-cell">
                      <img src={product.image || 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=300'} alt="" />
                      <span>{product.name || 'Unnamed Product'}</span>
                    </div>
                  </td>
                  <td>{category}</td>
                  <td className="price-cell">₹{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>
                    {stock === 0 ? (
                      <span className="stock-badge-pill out-of-stock">
                        Out Of Stock
                      </span>
                    ) : stock < 10 ? (
                      <span className="stock-badge-pill low-stock">
                        Low Stock ({stock})
                      </span>
                    ) : (
                      <span className="stock-badge-pill in-stock">
                        In Stock ({stock})
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEditClick(product)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      Delete
                    </button>
                    <button className="menu-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing 1 to {filteredProducts.length} of {products.length} products</p>
          <div className="footer-right">
            <div className="per-page">
              <span>10 per page</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div className="pagination">
              <button className="page-nav"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <button className="page-num active">1</button>
              <button className="page-nav"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }} 
        footer={
          <div className="modal-footer-btns">
            <button className="cancel-btn" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</button>
            <button className="save-submit-btn" onClick={handleSaveProduct}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Save Product
            </button>
          </div>
        }
      >
        <div className="modal-custom-header">
          <div className="modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="modal-title-box">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <p>{editingProduct ? 'Modify the product details below.' : 'Fill in the details below to add a new product to your store.'}</p>
          </div>
        </div>

        <div className="modal-form">
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <div className="input-with-icon-right">
              <input 
                type="text" 
                placeholder="e.g. Modern Coffee Table" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Describe the product..." 
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (Rupees) <span className="required">*</span></label>
              <div className="input-with-icon">
                <div className="input-prefix">₹</div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Stock Quantity <span className="required">*</span></label>
              <div className="input-with-icon">
                <div className="input-prefix">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                </div>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Category <span className="optional">(optional)</span></label>
            <div className="input-with-icon">
              <div className="input-prefix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path></svg>
              </div>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select category (optional)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <div className="select-suffix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Product Images <span style={{ color: '#ef4444' }}>*</span></label>
            <p className="help-text">Upload between 1 and 6 images of your product. (Current: {productImages.length}/6)</p>
            
            <input 
              type="file" 
              ref={imageInputRef} 
              style={{ display: 'none' }} 
              multiple 
              accept="image/*"
              onChange={handleProductImageUpload}
            />

            <div className="product-upload-box" onClick={() => imageInputRef.current.click()}>
              <div className="upload-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M17.5 19a5.5 5.5 0 0 0 1-10.9A7 7 0 0 0 5 8.4a5 5 0 0 0 0 9.6"></path><polyline points="17 13 12 8 7 13"></polyline><line x1="12" y1="8" x2="12" y2="18"></line></svg>
              </div>
              <div className="upload-text">
                <strong>Drag & drop images here</strong>
                <span>or <button className="text-btn" onClick={(e) => { e.stopPropagation(); imageInputRef.current.click(); }}>Choose Files</button></span>
                <p className="upload-sub">PNG, JPG or WEBP (max. 5MB each)</p>
              </div>
            </div>

            {productImages.length > 0 && (
              <div className="images-preview-grid">
                {productImages.map((img, index) => (
                  <div key={index} className={`image-preview-item ${index === 0 ? 'is-main' : ''}`}>
                    <img src={img} alt={`Preview ${index}`} />
                    {index === 0 ? (
                      <span className="main-image-badge">⭐ Main</span>
                    ) : (
                      <button 
                        type="button" 
                        className="set-main-action-btn" 
                        onClick={(e) => { e.stopPropagation(); setAsMain(index); }}
                      >
                        Set Main
                      </button>
                    )}
                    <button type="button" className="remove-image-btn" onClick={(e) => { e.stopPropagation(); removeProductImage(index); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Tabs Customization Section */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Product Tabs (Specifications, Shipping & Returns)</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Dimensions</label>
                <input 
                  type="text" 
                  placeholder="e.g. Standard size, 55cm x 55cm x 85cm" 
                  value={formData.spec_dimensions}
                  onChange={(e) => setFormData({...formData, spec_dimensions: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Material</label>
                <input 
                  type="text" 
                  placeholder="e.g. Solid Oak Wood & Premium Fabric" 
                  value={formData.spec_material}
                  onChange={(e) => setFormData({...formData, spec_material: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '8px' }}>
              <div className="form-group">
                <label>Finish</label>
                <input 
                  type="text" 
                  placeholder="e.g. Satin matte protective coating" 
                  value={formData.spec_finish}
                  onChange={(e) => setFormData({...formData, spec_finish: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Warranty</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2 Year Manufacturer Warranty" 
                  value={formData.spec_warranty}
                  onChange={(e) => setFormData({...formData, spec_warranty: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Origin</label>
                <input 
                  type="text" 
                  placeholder="e.g. Handcrafted in India" 
                  value={formData.spec_origin}
                  onChange={(e) => setFormData({...formData, spec_origin: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '8px' }}>
              <label>Shipping Details (Custom text or list)</label>
              <textarea 
                placeholder="Enter standard shipping policies, delivery timelines, carrier specifications..." 
                rows="3"
                value={formData.shipping_details}
                onChange={(e) => setFormData({...formData, shipping_details: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group" style={{ marginTop: '8px' }}>
              <label>Return Policy (Custom text or list)</label>
              <textarea 
                placeholder="Enter refund windows, item condition requirements, defect policies..." 
                rows="3"
                value={formData.return_policy}
                onChange={(e) => setFormData({...formData, return_policy: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* SEO Optimization Section */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>SEO Optimization</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>SEO Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Leather Sofa - Buy Online" 
                  value={formData.seo_title}
                  onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                />
                <span className="help-text">Current: {formData.seo_title.length} chars</span>
              </div>
              <div className="form-group">
                <label>Canonical URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/product" 
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '8px' }}>
              <label>SEO Description</label>
              <textarea 
                placeholder="Description snippet that appears in search results..." 
                rows="2"
                value={formData.seo_description}
                onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
              ></textarea>
              <span className="help-text">Current: {formData.seo_description.length} chars</span>
            </div>

            <div className="form-row" style={{ marginTop: '8px' }}>
              <div className="form-group">
                <label>Open Graph Title</label>
                <input 
                  type="text" 
                  placeholder="Social share title" 
                  value={formData.og_title}
                  onChange={(e) => setFormData({...formData, og_title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Open Graph Description</label>
                <textarea 
                  placeholder="Social share description" 
                  rows="2"
                  value={formData.og_description}
                  onChange={(e) => setFormData({...formData, og_description: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Google Search Preview for Product */}
            <div className="google-preview-container" style={{ marginTop: '16px' }}>
              <h4>Google Search Preview</h4>
              <div className="google-preview-box">
                <div className="google-url">
                  {formData.canonical_url || `https://launchcart.com/store/store-slug/product/${editingProduct?.slug || 'product-slug'}`}
                </div>
                <div className="google-title">
                  {formData.seo_title || formData.name || 'Product Name'}
                </div>
                <div className="google-description">
                  {formData.seo_description || formData.description || 'No description provided. Add an SEO description to help people find your product.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Filter Products</h2>
          <button className="close-drawer" onClick={() => setIsFilterOpen(false)}>&times;</button>
        </div>
        
        <div className="drawer-content">
          <div className="filter-section">
            <div className="section-header">
              <h3>Status</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {['Published', 'Draft', 'Out of Stock'].map(s => (
                <label key={s} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filters.status.includes(s)} 
                    onChange={() => toggleFilter('status', s)}
                  />
                  <span className="checkbox-custom"></span>
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Category</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filters.category.includes(cat.name)} 
                    onChange={() => toggleFilter('category', cat.name)}
                  />
                  <span className="checkbox-custom"></span>
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Stock Availability</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {['All', 'In Stock', 'Low Stock (<10)', 'Out of Stock'].map(s => (
                <label key={s} className="radio-label">
                  <input 
                    type="radio" 
                    name="stock"
                    checked={filters.stock === s} 
                    onChange={() => handleFilterChange('stock', s)}
                  />
                  <span className="radio-custom"></span>
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Price Range</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min Price" 
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Sort By</h3>
            </div>
            <select 
              className="drawer-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="az">Alphabetical A–Z</option>
              <option value="za">Alphabetical Z–A</option>
              <option value="stock">Stock Quantity</option>
            </select>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Date Added</h3>
            </div>
            <select 
              className="drawer-select"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="reset-btn" onClick={resetFilters}>Reset</button>
          <button className="apply-btn" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
        </div>
      </div>
      {isFilterOpen && <div className="drawer-overlay" onClick={() => setIsFilterOpen(false)}></div>}

      <style jsx>{`
        .products-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stock-badge-pill {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .stock-badge-pill.out-of-stock {
          background: #fee2e2;
          color: #ef4444;
        }
        .stock-badge-pill.low-stock {
          background: #fffbeb;
          color: #f59e0b;
        }
        .stock-badge-pill.in-stock {
          background: #dcfce7;
          color: #22c55e;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .header-left p {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .add-product-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-product-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 8px;
        }

        .summary-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .summary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-info {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .summary-info h3 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          line-height: 1;
        }

        .summary-info p {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin: 4px 0 0 0;
          white-space: nowrap;
        }

        .summary-spark {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.5;
          pointer-events: none;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 8px;
        }

        .search-box {
          flex: 1;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          height: 48px;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: #1e293b;
          background: transparent;
        }

        .filter-btn-toggle {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0 16px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-btn-toggle:hover, .filter-btn-toggle.active {
          border-color: #6366f1;
          background: #f5f3ff;
          color: #6366f1;
        }

        .filter-badge {
          background: #6366f1;
          color: #fff;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .chevron { transition: transform 0.2s; }
        .chevron.up { transform: rotate(180deg); }

        .active-filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }

        .active-chips {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .results-text {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-right: 12px;
        }

        .filter-chip {
          background: #f5f3ff;
          color: #6366f1;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e0e7ff;
        }

        .filter-chip button {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .clear-all-btn {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
        }

        .filter-drawer {
          position: fixed;
          top: 0;
          right: -400px;
          width: 380px;
          height: 100%;
          background: #fff;
          box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          z-index: 1000;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .filter-drawer.open {
          right: 0;
        }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .close-drawer {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-label, .radio-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-custom, .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #e2e8f0;
          border-radius: 5px;
          position: relative;
          transition: all 0.2s;
        }

        .radio-custom { border-radius: 50%; }

        input:checked + .checkbox-custom {
          background: #6366f1;
          border-color: #6366f1;
        }

        input:checked + .radio-custom {
          border-color: #6366f1;
        }

        input:checked + .radio-custom::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price-inputs input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
          font-weight: 600;
        }

        .drawer-select {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .drawer-footer {
          padding: 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 12px;
        }

        .reset-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }

        .apply-btn {
          flex: 2;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: #6366f1;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.1);
          backdrop-filter: blur(2px);
          z-index: 999;
        }

        .table-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .products-table th {
          background: #f8fafc;
          padding: 16px 24px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
        }

        .products-table th svg {
          margin-left: 4px;
          vertical-align: middle;
          color: #cbd5e1;
        }

        .products-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
        }

        .product-name-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .product-name-cell img {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          object-fit: cover;
          background: #f1f5f9;
        }

        .product-name-cell span {
          font-weight: 700;
          color: #1e293b;
        }

        .price-cell {
          font-weight: 600;
          color: #1e293b;
        }

        .status-pill {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: inline-block;
        }

        .status-pill.published { background: #dcfce7; color: #166534; }
        .status-pill.draft { background: #f1f5f9; color: #475569; }
        .status-pill.out-of-stock { background: #fee2e2; color: #b91c1c; }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-btn, .delete-btn {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn:hover { background: #f8fafc; }
        .delete-btn { color: #ef4444; }
        .delete-btn:hover { background: #fef2f2; border-color: #fecaca; }

        .menu-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
        }

        .menu-btn:hover { background: #f8fafc; color: #64748b; }

        .table-footer {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
        }

        .table-footer p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .per-page {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #1e293b;
          font-weight: 600;
          cursor: pointer;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .page-nav {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-nav:hover { background: #f8fafc; border-color: #cbd5e1; }

        .page-num {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }

        .page-num.active {
          background: #6366f1;
          color: #fff;
        }

        @media (max-width: 1200px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
          .header-row { flex-direction: column; align-items: flex-start; gap: 16px; }
          .add-product-btn { width: 100%; justify-content: center; }
          .actions-bar { flex-direction: column; }
          .table-container { overflow-x: auto; }
        }
        .modal-custom-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: -16px -16px 12px -16px;
          padding: 0 0 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5f3ff;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-box h2 {
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .modal-title-box p {
          font-size: 12px;
          color: #64748b;
          margin: 1px 0 0 0;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }

        .input-with-icon, .input-with-icon-right {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 10px;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f3ff;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
        }

        .input-with-icon input, .input-with-icon select {
          padding-left: 44px !important;
        }

        .input-with-icon-right svg {
          position: absolute;
          right: 10px;
          background: #f5f3ff;
          padding: 5px;
          border-radius: 6px;
        }

        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-group select {
          appearance: none;
          cursor: pointer;
        }

        .select-suffix {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #64748b;
        }

        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          border-color: #8b5cf6;
        }

        .required {
          color: #ef4444;
          margin-left: 2px;
        }

        .help-text {
          font-size: 11px;
          color: #94a3b8;
          margin: 0 0 1px 0;
        }

        .product-upload-box {
          border: 1.5px dashed #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #fff;
          transition: border-color 0.2s;
        }

        .product-upload-box:hover {
          border-color: #8b5cf6;
        }

        .upload-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5f3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .upload-text {
          display: flex;
          flex-direction: column;
        }

        .upload-text strong {
          font-size: 13px;
          color: #1e293b;
        }

        .upload-text span {
          font-size: 12px;
          color: #64748b;
        }

        .text-btn {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .upload-sub {
          font-size: 10px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .images-preview-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .image-preview-item {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .image-preview-item.is-main {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #8b5cf6;
          color: white;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          padding: 3px 0;
          z-index: 5;
        }

        .set-main-action-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.7);
          color: white;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          padding: 3px 0;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          z-index: 5;
        }

        .set-main-action-btn:hover {
          background: #8b5cf6;
        }

        .remove-image-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s, transform 0.2s;
          z-index: 10;
        }

        .remove-image-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
        }

        .cancel-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .save-submit-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .save-submit-btn:hover {
          background: #4f46e5;
        }

        .google-preview-container {
          margin-top: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .google-preview-container h4 {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .google-preview-box {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          text-align: left;
        }
        .google-url {
          font-size: 12px;
          color: #202124;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .google-title {
          font-size: 19px;
          color: #1a0dab;
          font-weight: 400;
          margin-bottom: 4px;
          line-height: 1.3;
          cursor: pointer;
        }
        .google-title:hover {
          text-decoration: underline;
        }
        .google-description {
          font-size: 14px;
          color: #4d5156;
          line-height: 1.55;
          word-wrap: break-word;
        }
        .optional {
          font-size: 11px;
          color: #94a3b8;
          font-weight: normal;
        }
      `}</style>
    </div>
  );
}
