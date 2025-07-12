import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import Preloader from './Preloader';

const PALLET_TYPES = ['standard', 'euro', 'custom', 'heavy-duty'];
const MATERIAL_TYPES = ['pine', 'ply', 'birch', 'recycled'];
const URGENCY_LEVELS = ['express', 'urgent'];

const SettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    basePalletCost: {
      standard: 800,
      euro: 950,
      custom: 1200,
      'heavy-duty': 1500
    },
    minimumOrderQuantity: 1,
    priceIncreasePercentBelowMinimum: 10,
    materialSurcharge: {
      pine: 100,
      ply: 120,
      birch: 150,
      recycled: 70
    },
    urgencyFee: {
      express: 1000,
      urgent: 500
    },
    shippingEstimate: 250,
    shippingPerPallet: true,
    cgstPercent: 9,
    sgstPercent: 9,
    paymentTermsNotes: '50% advance payment. Balance on delivery. Subject to standard terms and conditions.',
  });
  const [lastSavedSettings, setLastSavedSettings] = useState(null);

  const { refreshSettings } = useSettings();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    if (!user || !user.roles || !user.roles.includes('ROLE_ADMIN')) {
      setLoading(false);
      toast.error('You do not have permission to access admin settings');
      return;
    }
    api.get('/admin/settings')
      .then(res => {
        if (res.data) {
          setSettings(res.data);
          setLastSavedSettings(res.data);
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 403) {
          toast.error('You do not have permission to access admin settings');
        } else {
          toast.error('Failed to load settings');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value === '' ? '' : value }));
  };

  const handleNestedChange = (field, key, value) => {
    setSettings(prev => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved!');
      refreshSettings();
      setIsEditing(false);
      setLastSavedSettings(settings);
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (lastSavedSettings) {
      setSettings(lastSavedSettings);
    }
    setIsEditing(false);
  };

  if (loading) return <Preloader size={48} fullscreen={false} />;

  return (
    <div style={{ width: '75vw', maxWidth: 900, margin: '40px auto', padding: '32px', borderRadius: '24px', background: 'rgba(30,34,44,0.98)', boxShadow: '0 4px 32px #0003' }}>
      <h4 className="fw-bold text-center mb-4 text-light" style={{ letterSpacing: '0.5px' }}>Admin Settings</h4>
      {!isEditing && (
        <div className="text-end mb-3">
          <button type="button" className="btn btn-warning px-4 py-2 rounded-3 fw-bold shadow-sm" style={{ fontSize: '1.1rem', letterSpacing: '0.5px', transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      )}
      <form onSubmit={handleSave} className="row g-3" style={{ color: '#e0e6ed' }}>
        <div className="mb-2">
          <div className="fw-semibold text-warning mb-1" style={{ fontSize: '1.08rem', color: '#FFD600' }}>Base Pallet Cost <span className="text-secondary" style={{ color: '#b0b8c1' }}>(₹ per type)</span></div>
          <div className="row g-2">
            {PALLET_TYPES.map(type => (
              <div className="col-6 col-md-4" key={type}>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary rounded-3"
                  min={0}
                  value={settings.basePalletCost?.[type] || ''}
                  onChange={e => handleNestedChange('basePalletCost', type, parseFloat(e.target.value) || 0)}
                  placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
                  style={{ fontWeight: 500, color: '#e0e6ed', background: '#23272f' }}
                  readOnly={!isEditing}
                />
                <small className="ms-1" style={{ color: '#b0b8c1' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="row g-3 mb-2 align-items-center">
          <div className="col-6">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed' }}>Minimum Order Quantity</label>
            <input
              type="number"
              className="form-control bg-dark border-secondary rounded-3"
              min={1}
              value={settings.minimumOrderQuantity}
              onChange={e => handleChange('minimumOrderQuantity', e.target.value === '' ? '' : parseInt(e.target.value))}
              readOnly={!isEditing}
            />
          </div>
          <div className="col-6">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed' }}>Price Increase (%) if quantity &lt; minimum</label>
            <input
              type="number"
              className="form-control bg-dark border-secondary rounded-3"
              min={0}
              value={settings.priceIncreasePercentBelowMinimum}
              onChange={e => handleChange('priceIncreasePercentBelowMinimum', parseFloat(e.target.value) || 0)}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="mb-2">
          <div className="fw-semibold text-warning mb-1" style={{ fontSize: '1.08rem', color: '#FFD600' }}>Material Surcharge <span className="text-secondary" style={{ color: '#b0b8c1' }}>(₹ per material type)</span></div>
          <div className="row g-2">
            {MATERIAL_TYPES.map(type => (
              <div className="col-6 col-md-4" key={type}>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary rounded-3"
                  min={0}
                  value={settings.materialSurcharge?.[type] || ''}
                  onChange={e => handleNestedChange('materialSurcharge', type, parseFloat(e.target.value) || 0)}
                  placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
                  style={{ fontWeight: 500, color: '#e0e6ed', background: '#23272f' }}
                  readOnly={!isEditing}
                />
                <small className="ms-1" style={{ color: '#b0b8c1' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-2">
          <div className="fw-semibold text-warning mb-1" style={{ fontSize: '1.08rem', color: '#FFD600' }}>Urgency Fee <span className="text-secondary" style={{ color: '#b0b8c1' }}>(₹ per urgency level)</span></div>
          <div className="row g-2">
            {URGENCY_LEVELS.map(level => (
              <div className="col-6 col-md-4" key={level}>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary rounded-3"
                  min={0}
                  value={settings.urgencyFee?.[level] || ''}
                  onChange={e => handleNestedChange('urgencyFee', level, parseFloat(e.target.value) || 0)}
                  placeholder={level.charAt(0).toUpperCase() + level.slice(1)}
                  style={{ fontWeight: 500, color: '#e0e6ed', background: '#23272f' }}
                  readOnly={!isEditing}
                />
                <small className="ms-1" style={{ color: '#b0b8c1' }}>{level.charAt(0).toUpperCase() + level.slice(1)}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="row g-3 mb-2 align-items-end">
          <div className="col-6">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed' }}>Shipping Estimate (₹)</label>
            <input
              type="number"
              className="form-control bg-dark border-secondary rounded-3"
              min={0}
              value={settings.shippingEstimate}
              onChange={e => handleChange('shippingEstimate', parseFloat(e.target.value) || 0)}
              readOnly={!isEditing}
              style={{ color: '#e0e6ed', background: '#23272f' }}
            />
          </div>
        </div>
        <div className="row g-3 mb-2">
          <div className="col-6">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed' }}>CGST (%)</label>
            <input
              type="number"
              className="form-control bg-dark border-secondary rounded-3"
              min={0}
              value={settings.cgstPercent === '' ? '' : settings.cgstPercent}
              onChange={e => handleChange('cgstPercent', e.target.value === '' ? '' : parseFloat(e.target.value))}
              readOnly={!isEditing}
              style={{ color: '#e0e6ed', background: '#23272f' }}
            />
          </div>
          <div className="col-6">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed' }}>SGST (%)</label>
            <input
              type="number"
              className="form-control bg-dark border-secondary rounded-3"
              min={0}
              value={settings.sgstPercent === '' ? '' : settings.sgstPercent}
              onChange={e => handleChange('sgstPercent', e.target.value === '' ? '' : parseFloat(e.target.value))}
              readOnly={!isEditing}
              style={{ color: '#e0e6ed', background: '#23272f' }}
            />
          </div>
        </div>
        <div className="col-12 text-end mt-2">
          {isEditing && (
            <div className="text-end mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-3 fw-bold shadow-sm" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }} onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-5 py-2 rounded-3 fw-bold shadow-sm" style={{ fontSize: '1.1rem', letterSpacing: '0.5px', transition: 'background 0.2s, box-shadow 0.2s' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingsForm; 