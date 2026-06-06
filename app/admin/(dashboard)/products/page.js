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

  const filteredProducts = loading ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: 'name', label: 'Product Name', render: (row) => <span style={{ fontWeight: 700 }}>{row.name}</span> },
    { field: 'store', label: 'Store' },
    { field: 'category', label: 'Category' },
    { field: 'price', label: 'Price', render: (row) => `$${(row.price || 0).toLocaleString()}` },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Global Product Monitoring</h2>
          <p style={{ color: '#64748b' }}>Monitor and manage all products across all creator stores.</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input 
            placeholder="Search products or stores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredProducts} actions={actions} loading={loading} />
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
                <p className="price-tag">${(selectedProduct.price || 0).toLocaleString()}</p>
                <div className={`status-badge ${selectedProduct.status.toLowerCase()}`}>{selectedProduct.status}</div>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '24px' }}>
              <h4>Store Information</h4>
              <div className="detail-item"><strong>Sold by:</strong> <span>{selectedProduct.store}</span></div>
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
      `}</style>
    </div>
  );
}
