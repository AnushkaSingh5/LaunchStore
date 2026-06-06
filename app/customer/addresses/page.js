'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { customerService } from '@/services/customerService';
import { useLoading } from '@/components/TopLoader';

export default function CustomerAddressesPage() {
  const { customerProfile } = useCustomerAuth();
  const { startLoading, completeLoading } = useLoading();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const initialFormState = {
    name: 'Home',
    recipient_name: '', // Maps to full_name in the address table DDL
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_default: false
  };

  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!customerProfile) return;
    setLoading(true);
    try {
      const data = await customerService.getAddresses(customerProfile.id);
      setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [customerProfile]);

  const handleOpenAdd = () => {
    setForm(initialFormState);
    setFormErrors({});
    setEditingAddress(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (address) => {
    setForm({
      name: address.name || 'Home',
      recipient_name: address.full_name || '', // Map full_name column to form recipient_name
      phone: address.phone || '',
      address_line_1: address.address_line_1 || '',
      address_line_2: address.address_line_2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'US',
      is_default: address.is_default || false
    });
    setFormErrors({});
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.recipient_name.trim()) errors.recipient_name = 'Recipient name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.address_line_1.trim()) errors.address_line_1 = 'Address line 1 is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!form.postal_code.trim()) errors.postal_code = 'Postal code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    startLoading();

    // Map form fields to exact db columns:
    const payload = {
      name: form.name,
      full_name: form.recipient_name, // Maps recipient_name back to full_name DDL column
      phone: form.phone,
      address_line_1: form.address_line_1,
      address_line_2: form.address_line_2 || null,
      city: form.city,
      state: form.state,
      country: form.country,
      postal_code: form.postal_code,
      is_default: form.is_default
    };

    try {
      if (editingAddress) {
        // Update Address
        await customerService.updateAddress(editingAddress.id, customerProfile.id, payload);
      } else {
        // Create Address
        await customerService.createAddress({
          ...payload,
          customer_id: customerProfile.id
        });
      }
      setFormOpen(false);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
      alert('Error saving address: ' + err.message);
    } finally {
      setSubmitLoading(false);
      completeLoading();
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    startLoading();
    try {
      await customerService.deleteAddress(addressId);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address: ' + err.message);
    } finally {
      completeLoading();
    }
  };

  const handleSetDefault = async (addressId) => {
    startLoading();
    try {
      await customerService.setDefaultAddress(addressId, customerProfile.id);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address:', err);
      alert('Failed to set default address: ' + err.message);
    } finally {
      completeLoading();
    }
  };

  return (
    <div className="addresses-page fade-in">
      <div className="addresses-card dashboard-card">
        <div className="header-row">
          <div>
            <h2>Address Book</h2>
            <p className="subtitle">Manage shipping destinations for checkout auto-fill</p>
          </div>
          {!formOpen && (
            <button onClick={handleOpenAdd} className="add-btn">
              + Add Address
            </button>
          )}
        </div>

        <div className="divider"></div>

        {formOpen ? (
          <form onSubmit={handleFormSubmit} className="address-form fade-in">
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Address Name / Label</label>
                <select name="name" value={form.name} onChange={handleInputChange}>
                  <option value="Home">Home</option>
                  <option value="Work">Work / Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Recipient Full Name</label>
                <input 
                  type="text" 
                  name="recipient_name" 
                  value={form.recipient_name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. John Doe"
                  className={formErrors.recipient_name ? 'error-input' : ''}
                />
                {formErrors.recipient_name && <span className="error-text">{formErrors.recipient_name}</span>}
              </div>

              <div className="form-group">
                <label>Contact Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleInputChange} 
                  placeholder="e.g. +1 555-0199"
                  className={formErrors.phone ? 'error-input' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Address Line 1</label>
              <input 
                type="text" 
                name="address_line_1" 
                value={form.address_line_1} 
                onChange={handleInputChange} 
                placeholder="Street address, P.O. box, company name..."
                className={formErrors.address_line_1 ? 'error-input' : ''}
              />
              {formErrors.address_line_1 && <span className="error-text">{formErrors.address_line_1}</span>}
            </div>

            <div className="form-group">
              <label>Address Line 2 (Optional)</label>
              <input 
                type="text" 
                name="address_line_2" 
                value={form.address_line_2} 
                onChange={handleInputChange} 
                placeholder="Apartment, suite, unit, building, floor..."
              />
            </div>

            <div className="form-grid-three">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={form.city} 
                  onChange={handleInputChange} 
                  placeholder="San Francisco"
                  className={formErrors.city ? 'error-input' : ''}
                />
                {formErrors.city && <span className="error-text">{formErrors.city}</span>}
              </div>

              <div className="form-group">
                <label>State / Province</label>
                <input 
                  type="text" 
                  name="state" 
                  value={form.state} 
                  onChange={handleInputChange} 
                  placeholder="CA"
                  className={formErrors.state ? 'error-input' : ''}
                />
                {formErrors.state && <span className="error-text">{formErrors.state}</span>}
              </div>

              <div className="form-group">
                <label>Postal / Zip Code</label>
                <input 
                  type="text" 
                  name="postal_code" 
                  value={form.postal_code} 
                  onChange={handleInputChange} 
                  placeholder="94103"
                  className={formErrors.postal_code ? 'error-input' : ''}
                />
                {formErrors.postal_code && <span className="error-text">{formErrors.postal_code}</span>}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="is_default" 
                name="is_default"
                checked={form.is_default}
                onChange={handleInputChange}
              />
              <label htmlFor="is_default">Set as default shipping address</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="address-list">
            {loading ? (
              <div className="empty-state">
                <div className="spinner"></div>
                <p>Loading address book...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📍</span>
                <h3>No addresses saved</h3>
                <p>Add a shipping address to speed up checkout on your future orders.</p>
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map((address) => (
                  <div key={address.id} className={`address-card ${address.is_default ? 'default-card' : ''}`}>
                    <div className="card-top">
                      <span className="address-label">{address.name}</span>
                      {address.is_default && <span className="default-badge">Default</span>}
                    </div>
                    
                    <div className="card-info">
                      <h4 className="recipient-name">{address.full_name}</h4>
                      <p className="street">{address.address_line_1}</p>
                      {address.address_line_2 && <p className="street">{address.address_line_2}</p>}
                      <p className="city-state">{address.city}, {address.state} - {address.postal_code}</p>
                      <p className="phone">📞 {address.phone}</p>
                    </div>

                    <div className="card-actions">
                      <button onClick={() => handleOpenEdit(address)} className="card-action-btn edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(address.id)} className="card-action-btn delete">
                        Delete
                      </button>
                      {!address.is_default && (
                        <button onClick={() => handleSetDefault(address.id)} className="card-action-btn make-default">
                          Use as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .addresses-card {
          background: var(--white, #ffffff);
          border-radius: var(--radius-lg, 24px);
          padding: 40px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-sub, #64748b);
        }

        .add-btn {
          padding: 10px 20px;
          background: var(--primary, #121212);
          color: var(--white, #ffffff);
          font-weight: 700;
          font-size: 13px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.1);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--accent, #2563eb);
          transform: translateY(-1px);
        }

        .divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 24px 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          font-size: 48px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .empty-state p {
          font-size: 14px;
          color: var(--text-sub, #64748b);
          max-width: 320px;
          line-height: 1.6;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(0, 0, 0, 0.05);
          border-left-color: var(--accent, #2563eb);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Address Cards Grid */
        .address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .address-card {
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          padding: 20px;
          background: var(--white, #ffffff);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: var(--transition-smooth, all 0.3s);
        }

        .address-card:hover {
          box-shadow: var(--shadow-md);
          border-color: rgba(37, 99, 235, 0.1);
        }

        .default-card {
          border-color: var(--accent, #2563eb);
          background: rgba(37, 99, 235, 0.01);
          box-shadow: var(--shadow-soft);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .address-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.04);
          color: var(--text-sub, #64748b);
        }

        .default-badge {
          font-size: 10px;
          font-weight: 700;
          background: var(--accent, #2563eb);
          color: var(--white, #ffffff);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .recipient-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 4px;
        }

        .street, .city-state, .phone {
          font-size: 13px;
          color: var(--text-sub, #64748b);
          line-height: 1.5;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }

        .card-action-btn {
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 4px 0;
          transition: all 0.2s;
        }

        .card-action-btn.edit {
          color: var(--text-main, #1d1d1f);
        }

        .card-action-btn.edit:hover {
          color: var(--accent, #2563eb);
        }

        .card-action-btn.delete {
          color: #dc2626;
        }

        .card-action-btn.delete:hover {
          text-decoration: underline;
        }

        .card-action-btn.make-default {
          color: var(--accent, #2563eb);
          margin-left: auto;
        }

        .card-action-btn.make-default:hover {
          text-decoration: underline;
        }

        /* Form styling */
        .address-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
        }

        .address-form h3 {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1.5fr;
          gap: 20px;
        }

        .form-grid-three {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 14px;
          color: var(--text-main, #1d1d1f);
          outline: none;
          background: var(--white, #ffffff);
          transition: var(--transition-fast);
        }

        .form-group select {
          cursor: pointer;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--accent, #2563eb);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input {
          width: auto;
          cursor: pointer;
        }

        .checkbox-group label {
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .error-input {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
        }

        .error-text {
          font-size: 11px;
          color: #ef4444;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .save-btn, .cancel-btn {
          padding: 12px 24px;
          font-weight: 700;
          font-size: 13px;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .save-btn {
          background: var(--primary, #121212);
          color: var(--white, #ffffff);
        }

        .save-btn:hover {
          background: var(--accent, #2563eb);
          transform: translateY(-1px);
        }

        .cancel-btn {
          background: var(--bg-main, #f8f9fb);
          color: var(--text-main, #1d1d1f);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .cancel-btn:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 768px) {
          .form-grid, .form-grid-three {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
