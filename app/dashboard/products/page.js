'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/dashboardService';
import Table from '../../../components/UI/Table';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import Input from '../../../components/UI/Input';
import Select from '../../../components/UI/Select';

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
        color: row.status === 'Published' ? '#166534' : '#475569'
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
    <div className="fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Products</h2>
          <p style={{ color: 'var(--text-sub)' }}>Manage your inventory, pricing, and product details.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Product</Button>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <Table columns={columns} data={products} actions={actions} />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Product"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button>Save Product</Button>
          </>
        }
      >
        <Input label="Product Name" placeholder="e.g. Modern Coffee Table" />
        <Input label="Description" type="textarea" placeholder="Describe the product..." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Price ($)" type="number" placeholder="0.00" />
          <Input label="Stock Quantity" type="number" placeholder="0" />
        </div>
        <Select 
          label="Category" 
          options={[
            {label: 'Living Room', value: 'living_room'},
            {label: 'Bedroom', value: 'bedroom'},
            {label: 'Decor', value: 'decor'}
          ]} 
        />
      </Modal>
    </div>
  );
}
