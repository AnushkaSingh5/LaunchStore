'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

export default function AdminProducts() {
  const { products = [], deleteProduct, loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStockFilter, setSelectedStockFilter] = useState('All');

  const filteredProducts = loading ? [] : products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.store.toLowerCase().includes(searchQuery.toLowerCase());
    const stock = parseInt(p.stock) || 0;
    let matchesStock = true;
    if (selectedStockFilter === 'Out of Stock') {
      matchesStock = stock === 0;
    } else if (selectedStockFilter === 'Low Stock') {
      matchesStock = stock > 0 && stock < 10;
    }
    return matchesSearch && matchesStock;
  });

  const columns = [
    { 
      field: 'name', 
      label: 'Product Name', 
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="table-product-image-container">
            {row.image ? (
              <img src={row.image} alt={row.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '10px', color: '#94a3b8' }}>No Img</div>
            )}
          </div>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>{row.name}</span>
        </div>
      ) 
    },
    { field: 'store', label: 'Store' },
    { field: 'category', label: 'Category' },
    { field: 'price', label: 'Price', render: (row) => `₹${(row.price || 0).toLocaleString()}` },
    { field: 'stock', label: 'Stock', render: (row) => {
      const stock = parseInt(row.stock) || 0;
      return stock === 0 ? (
        <span className="stock-badge out-of-stock">Out of Stock</span>
      ) : stock < 10 ? (
        <span className="stock-badge low-stock">Low Stock ({stock})</span>
      ) : (
        <span className="stock-badge in-stock">In Stock ({stock})</span>
      );
    }},
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedProduct(row)}>Details</Button>
      <Button variant="danger" size="sm" onClick={() => {
        if (confirm(`Are you sure you want to remove "${row.name}" from the platform?`)) {
          deleteProduct(row.id);
        }
      }}>Remove</Button>
    </div>
  );

  return (
    <div className="admin-products">
      <div className="header-row">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Global Product Monitoring</h2>
          <p style={{ color: '#64748b' }}>Monitor and manage all products across all creator stores.</p>
        </div>
        <div className="search-wrap">
          <Input 
            placeholder="Search products or stores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-row">
        <button 
          onClick={() => setSelectedStockFilter('All')} 
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: '13px',
            background: selectedStockFilter === 'All' ? '#8b5cf6' : '#fff',
            color: selectedStockFilter === 'All' ? '#fff' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          All Products
        </button>
        <button 
          onClick={() => setSelectedStockFilter('Out of Stock')} 
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: '13px',
            background: selectedStockFilter === 'Out of Stock' ? '#ef4444' : '#fff',
            color: selectedStockFilter === 'Out of Stock' ? '#fff' : '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Out of Stock Products
        </button>
        <button 
          onClick={() => setSelectedStockFilter('Low Stock')} 
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: '13px',
            background: selectedStockFilter === 'Low Stock' ? '#f59e0b' : '#fff',
            color: selectedStockFilter === 'Low Stock' ? '#fff' : '#f59e0b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Low Stock Products
        </button>
      </div>
 
      {/* Desktop view: Table */}
      <div className="desktop-view-only card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredProducts} actions={actions} loading={loading} />
      </div>

      {/* Mobile view: Product Cards */}
      <div className="mobile-view-only mobile-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No products found.</div>
        ) : (
          filteredProducts.map(product => {
            const stock = parseInt(product.stock) || 0;
            return (
              <div key={product.id} className="mobile-product-card">
                <div className="mobile-card-top">
                  <div className="mobile-product-image-container">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="image-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="mobile-card-details">
                    <div className="mobile-product-name">{product.name}</div>
                    <div className="mobile-product-store">{product.store}</div>
                    <div className="mobile-product-category">{product.category}</div>
                    <div className="mobile-product-price">₹{(product.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="mobile-card-badge-area">
                    {stock === 0 ? (
                      <span className="stock-badge out-of-stock">Out of Stock</span>
                    ) : stock < 10 ? (
                      <span className="stock-badge low-stock">Low Stock ({stock})</span>
                    ) : (
                      <span className="stock-badge in-stock">In Stock ({stock})</span>
                    )}
                    <div className={`status-badge ${product.status.toLowerCase()}`} style={{ marginTop: '8px' }}>
                      {product.status}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedProduct(product)}>Details</Button>
                  <Button variant="danger" size="sm" onClick={() => {
                    if (confirm(`Are you sure you want to remove "${product.name}" from the platform?`)) {
                      deleteProduct(product.id);
                    }
                  }}>Remove</Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        title="Product Information"
        footer={<Button variant="secondary" onClick={() => setSelectedProduct(null)}>Close</Button>}
      >
        {selectedProduct && (
          <div className="product-details">
            <div className="product-main">
              <div className="product-image">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{selectedProduct.name}</h3>
                <p className="category-tag">{selectedProduct.category}</p>
                <p className="price-tag">₹{(selectedProduct.price || 0).toLocaleString()}</p>
                <div className={`status-badge ${selectedProduct.status.toLowerCase()}`}>{selectedProduct.status}</div>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '24px' }}>
              <h4>Store Information</h4>
              <div className="detail-item"><strong>Sold by:</strong> <span>{selectedProduct.store}</span></div>
            </div>

            <div className="detail-section" style={{ marginTop: '24px' }}>
              <h4>Inventory Status</h4>
              <div className="detail-item"><strong>Available Stock:</strong> <span>{selectedProduct.stock !== undefined ? selectedProduct.stock : 0} items</span></div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .product-main { display: flex; gap: 24px; }
        .product-image { width: 120px; height: 120px; border-radius: 12px; overflow: hidden; background: #f8fafc; border: 1px solid #f1f5f9; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; }
        .image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px; }
        .product-info h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .category-tag { font-size: 12px; color: #8b5cf6; font-weight: 600; margin: 4px 0; }
        .price-tag { font-size: 20px; font-weight: 800; color: #1e293b; margin: 8px 0; }
        .detail-section h4 { font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-item strong { font-size: 12px; color: #94a3b8; }
        .detail-item span { font-size: 14px; font-weight: 600; color: #1e293b; }
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
        }
        .status-badge.published { background: #dcfce7; color: #166534; }
        .status-badge.draft { background: #f1f5f9; color: #475569; }

        .stock-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .stock-badge.out-of-stock { background: #fee2e2; color: #991b1b; }
        .stock-badge.low-stock { background: #fffbeb; color: #b45309; }
        .stock-badge.in-stock { background: #dcfce7; color: #166534; }

        /* Desktop / Mobile view toggles */
        .desktop-view-only {
          display: block;
        }
        .mobile-view-only {
          display: none;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .search-wrap {
          width: 300px;
        }
        .filters-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .desktop-view-only {
            display: none !important;
          }
          .mobile-view-only {
            display: block !important;
          }
          .header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .search-wrap {
            width: 100% !important;
          }
          .filters-row {
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .filters-row button {
            flex: 1 !important;
            text-align: center !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
        }

        /* Mobile Product Card CSS */
        .mobile-product-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }
        .mobile-card-top {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          position: relative;
        }
        .mobile-product-image-container {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
        }
        .mobile-product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mobile-card-details {
          flex: 1;
          min-width: 0;
        }
        .mobile-product-name {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          word-break: break-word;
        }
        .mobile-product-store {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .mobile-product-category {
          font-size: 12px;
          color: #8b5cf6;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .mobile-product-price {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
        }
        .mobile-card-badge-area {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .mobile-card-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          border-top: 1px solid #f1f5f9;
          padding-top: 12px;
        }
        .mobile-card-actions button,
        .mobile-card-actions :global(button) {
          flex: 1 !important;
          justify-content: center !important;
          display: flex !important;
          align-items: center !important;
          padding: 10px 16px !important;
          font-size: 13px !important;
        }

        /* Desktop columns layout and spacing optimization */
        @media (min-width: 769px) {
          .admin-products table {
            table-layout: fixed !important;
            width: 100% !important;
          }
          .admin-products th:nth-child(1),
          .admin-products td:nth-child(1) {
            width: 25% !important;
          }
          .admin-products th:nth-child(2),
          .admin-products td:nth-child(2) {
            width: 13% !important;
          }
          .admin-products th:nth-child(3),
          .admin-products td:nth-child(3) {
            width: 15% !important;
          }
          .admin-products th:nth-child(4),
          .admin-products td:nth-child(4) {
            width: 10% !important;
          }
          .admin-products th:nth-child(5),
          .admin-products td:nth-child(5) {
            width: 13% !important;
          }
          .admin-products th:nth-child(6),
          .admin-products td:nth-child(6) {
            width: 11% !important;
          }
          .admin-products th:nth-child(7),
          .admin-products td:nth-child(7) {
            width: 13% !important;
          }
        }
      `}</style>
    </div>
  );
}
