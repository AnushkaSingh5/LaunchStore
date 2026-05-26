'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import { useDashboard } from '@/context/DashboardContext';

export default function CategoriesPage() {
  const { categories, products, loading, addCategory, updateCategory, deleteCategory } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    status: [],
    productCount: 'All',
    sortBy: 'most_products',
    dateRange: 'all',
    visibility: []
  });

  const [categoryImage, setCategoryImage] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setNewCategoryName(cat.name);
    setCategoryImage(cat.image);
    setIsModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: newCategoryName, image: categoryImage });
    } else {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        productCount: 0,
        status: 'Active',
        description: `New ${newCategoryName} collection.`,
        image: categoryImage
      };
      addCategory(newCategory);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setCategoryImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCategories = (categories || []).filter(cat => {
    if (!cat) return false;
    const name = String(cat.name || '');
    const description = String(cat.description || '');
    const status = String(cat.status || 'Active');
    const productCount = parseInt(cat.productCount) || 0;

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(status);
    
    let matchesCount = true;
    if (filters.productCount === '0 Products') matchesCount = productCount === 0;
    else if (filters.productCount === '1-10 Products') matchesCount = productCount >= 1 && productCount <= 10;
    else if (filters.productCount === '10-25 Products') matchesCount = productCount > 10 && productCount <= 25;
    else if (filters.productCount === '25+ Products') matchesCount = productCount > 25;

    return matchesSearch && matchesStatus && matchesCount;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    const aCount = parseInt(a.productCount) || 0;
    const bCount = parseInt(b.productCount) || 0;
    const aName = String(a.name || '');
    const bName = String(b.name || '');

    if (filters.sortBy === 'most_products') return bCount - aCount;
    if (filters.sortBy === 'least_products') return aCount - bCount;
    if (filters.sortBy === 'az') return aName.localeCompare(bName);
    if (filters.sortBy === 'za') return bName.localeCompare(aName);
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

  const handleDeleteCategory = (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      productCount: 'All',
      sortBy: 'most_products',
      dateRange: 'all',
      visibility: []
    });
  };

  const activeFilterCount = filters.status.length + 
                           (filters.productCount !== 'All' ? 1 : 0) + 
                           filters.visibility.length;

  const totalCategories = categories.length;
  const totalProducts = products.length;
  
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    actualCount: products.filter(p => p.category === cat.name).length
  }));

  const mostProductsCategory = categoriesWithCounts.length > 0 
    ? [...categoriesWithCounts].sort((a, b) => b.actualCount - a.actualCount)[0] 
    : { name: '-', actualCount: 0 };

  const emptyCategoriesCount = categoriesWithCounts.filter(cat => cat.actualCount === 0).length;

  return (
    <div className="categories-page">

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
              <span className="sub">{mostProductsCategory.actualCount} items</span>
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
              <span className="value">{emptyCategoriesCount}</span>
              <span className="sub" style={{ color: emptyCategoriesCount === 0 ? '#10b981' : '#ef4444' }}>{emptyCategoriesCount === 0 ? 'Great job!' : 'Needs attention'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <button className={`filter-btn-toggle ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter
            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            <svg className={`chevron ${isFilterOpen ? 'up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>

      {(activeFilterCount > 0 || searchQuery) && (
        <div className="active-filters-row">
          <div className="active-chips">
            <span className="results-text">{filteredCategories.length} categories found</span>
            {filters.status.map(s => (
              <div key={s} className="filter-chip">
                Status: {s}
                <button onClick={() => toggleFilter('status', s)}>&times;</button>
              </div>
            ))}
            {filters.productCount !== 'All' && (
              <div className="filter-chip">
                Products: {filters.productCount}
                <button onClick={() => handleFilterChange('productCount', 'All')}>&times;</button>
              </div>
            )}
          </div>
          <button className="clear-all-btn" onClick={resetFilters}>Clear all</button>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <div className="col-name">CATEGORY NAME</div>
          <div className="col-products">PRODUCTS</div>
          <div className="col-actions">ACTIONS</div>
        </div>
        <div className="list-body">
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="loading-state">No categories found matching your search.</div>
          ) : filteredCategories.map((cat, idx) => {
            const icons = [
              { bg: '#f5f3ff', color: '#8b5cf6', path: <path d="M7 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10z"></path> }, // placeholder path
              { bg: '#eff6ff', color: '#3b82f6', path: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> },
              { bg: '#fff7ed', color: '#f59e0b', path: <path d="M12 2L2 7l10 5 10-5-10-5z"></path> }
            ];
            const icon = icons[idx % icons.length];
            return (
              <div key={cat.id} className="category-row">
                <div className="cat-main">
                  <div className="cat-icon" style={{ background: icon.bg, color: icon.color, overflow: 'hidden' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {idx === 0 && <path d="M3 21h18M6 21V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12M9 13v2m6-2v2"></path>}
                        {idx === 1 && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>}
                        {idx === 2 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>}
                        {idx > 2 && <circle cx="12" cy="12" r="10"></circle>}
                      </svg>
                    )}
                  </div>
                  <div className="cat-details">
                    <h3>{cat.name}</h3>
                    <p>{cat.description || `Everything you need for your ${cat.name.toLowerCase()}.`}</p>
                  </div>
                </div>
                <div className="cat-products">
                  <span className="count-pill" style={{ background: icon.bg, color: icon.color }}>
                    {products.filter(p => p.category === cat.name).length} items
                  </span>
                </div>
                <div className="cat-actions">
                  <button className="row-btn edit" onClick={() => handleEditClick(cat)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                  </button>
                  <button className="row-btn delete" onClick={() => handleDeleteCategory(cat.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="list-footer">
          <p>Showing 1 to {filteredCategories.length} of {categories.length} categories</p>
          <div className="footer-right">
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button className="num-btn active">1</button>
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setCategoryImage(null);
          setNewCategoryName('');
        }}
        title={
          <div className="modal-custom-header">
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div className="modal-title-box">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <p>{editingCategory ? 'Modify your existing category details.' : 'Create a new category to organize your products.'}</p>
            </div>
          </div>
        }
        footer={
          <div className="modal-footer-btns">
            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="save-submit-btn" onClick={handleSaveCategory}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Save Category
            </button>
          </div>
        }
      >
        <div className="modal-form">
          <div className="form-group">
            <label>Category Name <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. Living Room" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Category Image</label>
            <p className="help-text">Upload an image to represent this category</p>
            <div className="modal-upload-box">
              {categoryImage ? (
                <div className="image-preview-container">
                  <img src={categoryImage} alt="Preview" />
                  <button className="remove-img-btn" onClick={() => setCategoryImage(null)}>&times;</button>
                </div>
              ) : (
                <>
                  <div className="upload-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <strong>Upload Image</strong>
                  <span>PNG, JPG or WEBP (max. 2MB)</span>
                </>
              )}
              <input 
                type="file" 
                id="category-upload" 
                hidden 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button className="choose-file-btn" onClick={() => document.getElementById('category-upload').click()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                {categoryImage ? 'Change File' : 'Choose File'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Filter Categories</h2>
          <button className="close-drawer" onClick={() => setIsFilterOpen(false)}>&times;</button>
        </div>
        
        <div className="drawer-content">
          <div className="filter-section">
            <div className="section-header">
              <h3>Category Status</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {['Active Categories', 'Hidden Categories', 'Empty Categories', 'Featured Categories'].map(s => (
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
              <h3>Product Count</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {['All', '0 Products', '1-10 Products', '10-25 Products', '25+ Products'].map(c => (
                <label key={c} className="radio-label">
                  <input 
                    type="radio" 
                    name="pCount"
                    checked={filters.productCount === c} 
                    onChange={() => handleFilterChange('productCount', c)}
                  />
                  <span className="radio-custom"></span>
                  {c}
                </label>
              ))}
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
              <option value="most_products">Most Products</option>
              <option value="least_products">Least Products</option>
              <option value="az">Alphabetical A-Z</option>
              <option value="za">Alphabetical Z-A</option>
              <option value="recent">Recently Added</option>
              <option value="updated">Recently Updated</option>
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

          <div className="filter-section">
            <div className="section-header">
              <h3>Visibility / Storefront</h3>
            </div>
            <div className="filter-options">
              {['Visible on Homepage', 'Hidden from Homepage', 'Featured Collection'].map(v => (
                <label key={v} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filters.visibility.includes(v)} 
                    onChange={() => toggleFilter('visibility', v)}
                  />
                  <span className="checkbox-custom"></span>
                  {v}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="reset-btn" onClick={resetFilters}>Reset</button>
          <button className="apply-btn" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
        </div>
      </div>
      {isFilterOpen && <div className="drawer-overlay" onClick={() => setIsFilterOpen(false)}></div>}
      <style jsx>{`
        .categories-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
        }


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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .summary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
          border-color: #e2e8f0;
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

        .filter-dropdown-container {
          position: relative;
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
        }

        .filter-btn-toggle:hover, .filter-btn-toggle.active {
          border-color: #6366f1;
          color: #6366f1;
          background: #f5f3ff;
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

        .active-filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -8px;
        }

        .active-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .results-text {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-right: 8px;
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
          gap: 6px;
          border: 1px solid #e0e7ff;
        }

        .filter-chip button {
          background: none; border: none; color: #6366f1; font-size: 16px; cursor: pointer; padding: 0;
        }

        .clear-all-btn {
          background: none; border: none; color: #6366f1; font-weight: 700; font-size: 13px;
          cursor: pointer; text-decoration: underline;
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
          gap: 16px;
        }

        .modal-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
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
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .required { color: #ef4444; }

        .form-group input[type="text"] {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          outline: none;
        }

        .help-text {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .modal-upload-box {
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .modal-upload-box:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        .upload-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .modal-upload-box strong { font-size: 14px; color: #1e293b; }
        .modal-upload-box span { font-size: 12px; color: #94a3b8; }

        .choose-file-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .choose-file-btn:hover {
          border-color: #6366f1;
          color: #6366f1;
        }

        .image-preview-container {
          position: relative;
          width: 100%;
          max-width: 200px;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .image-preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-img-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          backdrop-filter: blur(4px);
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
