'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/dashboardService';
import Table from '../../../components/UI/Table';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import Input from '../../../components/UI/Input';

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

  const columns = [
    { field: 'name', label: 'Category Name', render: (row) => <span style={{fontWeight: 600}}>{row.name}</span> },
    { field: 'productCount', label: 'Products', render: (row) => `${row.productCount} items` },
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
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Categories</h2>
          <p style={{ color: 'var(--text-sub)' }}>Organize your products into collections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Category</Button>
      </div>

      {loading ? (
        <div>Loading categories...</div>
      ) : (
        <Table columns={columns} data={categories} actions={actions} />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button>Save Category</Button>
          </>
        }
      >
        <Input label="Category Name" placeholder="e.g. Living Room" />
        <div style={{
          background: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          height: '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-sub)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: '32px' }}>📁</span>
          <span>Upload Category Image</span>
        </div>
      </Modal>
    </div>
  );
}
