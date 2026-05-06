'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await dashboardService.getCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const totalCategories = categories.length;
  const totalProducts = categories.reduce((acc, cat) => acc + cat.productCount, 0);
  const mostProductsCategory = categories.length > 0 ? [...categories].sort((a, b) => b.productCount - a.productCount)[0] : { name: '-', productCount: 0 };
  const emptyCategories = categories.filter(cat => cat.productCount === 0).length;

  return (
    <div className="categories-page">
      <div className="breadcrumbs">
        <span>Dashboard</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <span className="current">Categories</span>
      </div>

      <div className="header-row">
        <div className="header-left">
          <h1>Categories</h1>
          <p>Organize your products into collections.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Category
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div className="card-info">
              <span className="label">Total Categories</span>
              <span className="value">{totalCategories}</span>
              <span className="sub">All categories</span>
            </div>
            <div className="mini-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <div className="card-info">
              <span className="label">Total Products</span>
              <span className="value">{totalProducts}</span>
              <span className="sub">Across all categories</span>
            </div>
            <div className="mini-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path></svg>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path></svg>
            </div>
            <div className="card-info">
              <span className="label">Most Products</span>
              <span className="value" style={{ fontSize: '20px' }}>{mostProductsCategory.name}</span>
              <span className="sub">{mostProductsCategory.productCount} items</span>
            </div>
            <div className="mini-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M18 17l-6-6-4 4-5-5"></path></svg>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <div className="card-info">
              <span className="label">Empty Categories</span>
              <span className="value">{emptyCategories}</span>
              <span className="sub" style={{ color: emptyCategories === 0 ? '#10b981' : '#ef4444' }}>{emptyCategories === 0 ? 'Great job!' : 'Needs attention'}</span>
            </div>
            <div className="mini-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search categories..." />
        </div>
        <button className="filter-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

      <div className="list-container">
        <div className="list-header">
          <div className="col-name">CATEGORY NAME</div>
          <div className="col-products">PRODUCTS</div>
          <div className="col-actions">ACTIONS</div>
        </div>
        <div className="list-body">
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : categories.map((cat, idx) => {
            const icons = [
              { bg: '#f5f3ff', color: '#8b5cf6', path: <path d="M7 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10z"></path> }, // placeholder path
              { bg: '#eff6ff', color: '#3b82f6', path: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> },
              { bg: '#fff7ed', color: '#f59e0b', path: <path d="M12 2L2 7l10 5 10-5-10-5z"></path> }
            ];
            const icon = icons[idx % icons.length];
            return (
              <div key={cat.id} className="category-row">
                <div className="cat-main">
                  <div className="cat-icon" style={{ background: icon.bg, color: icon.color }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {idx === 0 && <path d="M3 21h18M6 21V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12M9 13v2m6-2v2"></path>}
                      {idx === 1 && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>}
                      {idx === 2 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>}
                      {idx > 2 && <circle cx="12" cy="12" r="10"></circle>}
                    </svg>
                  </div>
                  <div className="cat-details">
                    <h3>{cat.name}</h3>
                    <p>{cat.description || `Everything you need for your ${cat.name.toLowerCase()}.`}</p>
                  </div>
                </div>
                <div className="cat-products">
                  <span className="count-pill" style={{ background: icon.bg, color: icon.color }}>
                    {cat.productCount} items
                  </span>
                </div>
                <div className="cat-actions">
                  <button className="row-btn edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                  </button>
                  <button className="row-btn delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="list-footer">
          <p>Showing 1 to {categories.length} of {categories.length} categories</p>
          <div className="footer-right">
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button className="num-btn active">1</button>
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
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
              Save Category
            </button>
          </div>
        }
      >
        <div className="modal-custom-header">
          <div className="modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div className="modal-title-box">
            <h2>Add New Category</h2>
            <p>Create a new category to organize your products.</p>
          </div>
        </div>

        <div className="modal-form">
          <div className="form-group">
            <label>Category Name <span className="required">*</span></label>
            <input type="text" placeholder="e.g. Living Room" />
          </div>
          
          <div className="form-group">
            <label>Category Image</label>
            <p className="help-text">Upload an image to represent this category</p>
            <div className="modal-upload-box">
              <div className="upload-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <strong>Upload Image</strong>
              <span>PNG, JPG or WEBP (max. 2MB)</span>
              <button className="choose-file-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Choose File
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <style jsx>{`
        .categories-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: -8px;
        }

        .breadcrumbs svg { color: #cbd5e1; }
        .breadcrumbs span.current { color: #8b5cf6; font-weight: 600; }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .add-btn {
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

        .add-btn:hover { background: #4f46e5; transform: translateY(-1px); }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .summary-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
        }

        .icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-info .label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 2px;
        }

        .card-info .value {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }

        .card-info .sub {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 2px;
        }

        .mini-icon {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          gap: 16px;
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

        .list-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .list-header {
          background: #f8fafc;
          padding: 16px 32px;
          display: flex;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
        }

        .col-name { flex: 2; }
        .col-products { flex: 1; text-align: center; }
        .col-actions { flex: 1; text-align: right; }

        .category-row {
          padding: 24px 32px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .category-row:hover { background: #fbfaff; }

        .cat-main {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cat-details h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .cat-details p {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .cat-products {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .count-pill {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .cat-actions {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .row-btn {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .row-btn.edit:hover { background: #f8fafc; }
        .row-btn.delete { color: #ef4444; }
        .row-btn.delete:hover { background: #fef2f2; border-color: #fecaca; }

        .list-footer {
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-footer p { font-size: 13px; color: #64748b; }
        .footer-right { display: flex; align-items: center; gap: 8px; }

        .nav-btn {
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
        }

        .num-btn {
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

        .num-btn.active { background: #6366f1; color: #fff; }

        @media (max-width: 1024px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
          .category-row { flex-direction: column; align-items: flex-start; gap: 20px; }
          .cat-products, .cat-actions { justify-content: flex-start; width: 100%; }
        }

        /* Modal Specific Styles */
        .modal-custom-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: -16px -16px 16px -16px;
          padding: 0 0 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f5f3ff;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-box h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .modal-title-box p {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }

        .form-group input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          border-color: #8b5cf6;
        }

        .required {
          color: #ef4444;
          margin-left: 2px;
        }

        .help-text {
          font-size: 12px;
          color: #94a3b8;
          margin: 0 0 2px 0;
        }

        .modal-upload-box {
          border: 1.5px dashed #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: #fff;
          transition: border-color 0.2s;
        }

        .modal-upload-box:hover {
          border-color: #8b5cf6;
        }

        .upload-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5f3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .modal-upload-box strong {
          font-size: 13px;
          color: #1e293b;
        }

        .modal-upload-box span {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .choose-file-btn {
          background: #fff;
          border: 1px solid #8b5cf6;
          color: #8b5cf6;
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .choose-file-btn:hover {
          background: #f5f3ff;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;
        }

        .cancel-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .save-submit-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 10px;
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
