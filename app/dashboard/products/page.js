'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await dashboardService.getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const publishedCount = products.filter(p => p.status === 'Published').length;
  const draftCount = products.filter(p => p.status === 'Draft').length;
  const outOfStockCount = products.filter(p => p.stock === 0 || p.status === 'Out of Stock').length;

  const columns = [
    { field: 'id', label: 'SKU' },
    { field: 'name', label: 'Product Name', render: (row) => <span style={{fontWeight: 600}}>{row.name}</span> },
    { field: 'category', label: 'Category' },
    { field: 'price', label: 'Price', render: (row) => `$${row.price.toLocaleString()}` },
    { field: 'stock', label: 'Stock', render: (row) => (
      <span style={{ color: row.stock === 0 ? '#ef4444' : 'inherit' }}>
        {row.stock === 0 ? 'Out of Stock' : row.stock}
      </span>
    )},
    { field: 'status', label: 'Status', render: (row) => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '12px',
        fontWeight: 600,
        background: row.status === 'Published' ? '#dcfce7' : '#f1f5f9',
        color: row.status === 'Published' ? '#16a34a' : '#475569'
      }}>
        {row.status}
      </span>
    )},
  ];

  const actions = (row) => (
    <>
      <Button variant="secondary" size="sm">Edit</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </>
  );

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
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none"><path d="M0 20 Q 15 5, 30 15 T 60 5" stroke="#8b5cf6" strokeWidth="2" fill="none"/></svg>
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
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none"><path d="M0 15 Q 15 20, 30 10 T 60 5" stroke="#10b981" strokeWidth="2" fill="none"/></svg>
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
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none"><path d="M0 20 L 15 18 L 30 22 L 60 10" stroke="#f59e0b" strokeWidth="2" fill="none"/></svg>
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
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none"><path d="M0 10 Q 15 5, 30 20 T 60 10" stroke="#ef4444" strokeWidth="2" fill="none"/></svg>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search products..." />
        </div>
        <button className="filter-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

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
            ) : products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <div className="product-name-cell">
                    <img src={product.image || 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=300'} alt="" />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td className="price-cell">${product.price.toLocaleString()}</td>
                <td>
                  <span style={{ color: product.stock === 0 ? '#ef4444' : 'inherit', fontWeight: product.stock === 0 ? 600 : 400 }}>
                    {product.stock === 0 ? 'Out of Stock' : product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${product.status.toLowerCase()}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Edit
                    </button>
                    <button className="delete-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      Delete
                    </button>
                    <button className="menu-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <p>Showing 1 to {products.length} of {products.length} products</p>
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
        onClose={() => setIsModalOpen(false)} 
        footer={
          <div className="modal-footer-btns">
            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="save-submit-btn">
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
            <h2>Add New Product</h2>
            <p>Fill in the details below to add a new product to your store.</p>
          </div>
        </div>

        <div className="modal-form">
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <div className="input-with-icon-right">
              <input type="text" placeholder="e.g. Modern Coffee Table" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Describe the product..." rows="2"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (USD) <span className="required">*</span></label>
              <div className="input-with-icon">
                <div className="input-prefix">$</div>
                <input type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label>Stock Quantity <span className="required">*</span></label>
              <div className="input-with-icon">
                <div className="input-prefix">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                </div>
                <input type="number" placeholder="0" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <div className="input-with-icon">
              <div className="input-prefix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path></svg>
              </div>
              <select defaultValue="">
                <option value="" disabled>Select category</option>
                <option value="living_room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="decor">Decor</option>
              </select>
              <div className="select-suffix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <p className="help-text">Upload one or more images of your product.</p>
            <div className="product-upload-box">
              <div className="upload-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M17.5 19a5.5 5.5 0 0 0 1-10.9A7 7 0 0 0 5 8.4a5 5 0 0 0 0 9.6"></path><polyline points="17 13 12 8 7 13"></polyline><line x1="12" y1="8" x2="12" y2="18"></line></svg>
              </div>
              <div className="upload-text">
                <strong>Drag & drop images here</strong>
                <span>or <button className="text-btn">Choose Files</button></span>
                <p className="upload-sub">PNG, JPG or WEBP (max. 5MB each)</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .products-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
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

        .summary-info h3 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .summary-info p {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin: 0;
        }

        .summary-spark {
          position: absolute;
          right: 12px;
          bottom: 12px;
          opacity: 0.6;
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

        .filter-button {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
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
      `}</style>
    </div>
  );
}
