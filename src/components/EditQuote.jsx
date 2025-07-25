import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calculator, Send, AlertCircle } from 'lucide-react';
import Preloader from './Preloader';

const palletTypes = [
  { value: 'standard', label: 'Standard Pallet', basePrice: 800 },
  { value: 'euro', label: 'Euro Pallet', basePrice: 950 },
  { value: 'custom', label: 'Custom Design', basePrice: 1200 },
  { value: 'heavy-duty', label: 'Heavy Duty', basePrice: 1500 }
];
const materials = [
  { value: 'pine', label: 'Pine Wood', multiplier: 1.0 },
  { value: 'ply', label: 'Ply Wood', multiplier: 1.2 },
  { value: 'birch', label: 'Birch Wood', multiplier: 1.5 },
  { value: 'recycled', label: 'Recycled Wood', multiplier: 0.7 }
];
const urgencyOptions = [
  { value: 'standard', label: 'Standard (7-10 days)', multiplier: 1.0 },
  { value: 'urgent', label: 'Urgent (3-5 days)', multiplier: 1.3 },
  { value: 'express', label: 'Express (1-2 days)', multiplier: 1.8 }
];

const EditQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [adminSettings, setAdminSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { user } = useAuth();
  // Add state for real-time validation warnings
  const [dimensionWarnings, setDimensionWarnings] = useState({});

  useEffect(() => {
    api.get(`/quotes/${id}`)
      .then(res => {
        setForm(res.data.details);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load quote');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!user || !user.roles || !user.roles.includes('ROLE_ADMIN')) {
      setAdminSettings(null);
      setSettingsLoading(false);
      return;
    }
    api.get('/api/admin/settings')
      .then(res => setAdminSettings(res.data))
      .catch(err => {
        if (err.response && err.response.status === 403) {
          setAdminSettings(null);
          toast.error('You do not have permission to access admin settings');
        } else {
          setAdminSettings(null);
          toast.error('Failed to load pricing settings');
        }
      })
      .finally(() => setSettingsLoading(false));
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!form.palletType) errs.palletType = 'Pallet type is required';
    if (!form.quantity || form.quantity < 1) errs.quantity = 'Quantity is required';
    if (!form.material) errs.material = 'Material is required';
    if (!form.urgency) errs.urgency = 'Urgency is required';
    if (form.length && (form.length < 600 || form.length > 2000)) errs.length = 'Length must be between 600 and 2000 mm.';
    if (form.width && (form.width < 400 || form.width > 1500)) errs.width = 'Width must be between 400 and 1500 mm.';
    if (form.height && (form.height < 100 || form.height > 300)) errs.height = 'Height must be between 100 and 300 mm.';
    return errs;
  };

  // Add function to check dimension limits
  const checkDimensionLimits = (name, value) => {
    const numValue = Number(value);
    const warnings = { ...dimensionWarnings };
    
    if (name === 'length') {
      if (numValue < 600) {
        warnings.length = 'Length too small. Minimum is 600mm.';
      } else if (numValue > 2000) {
        warnings.length = 'Length too large. Maximum is 2000mm.';
      } else {
        delete warnings.length;
      }
    } else if (name === 'width') {
      if (numValue < 400) {
        warnings.width = 'Width too small. Minimum is 400mm.';
      } else if (numValue > 1500) {
        warnings.width = 'Width too large. Maximum is 1500mm.';
      } else {
        delete warnings.width;
      }
    } else if (name === 'height') {
      if (numValue < 100) {
        warnings.height = 'Height too small. Minimum is 100mm.';
      } else if (numValue > 300) {
        warnings.height = 'Height too large. Maximum is 300mm.';
      } else {
        delete warnings.height;
      }
    }
    
    setDimensionWarnings(warnings);
  };

  // Update handleChange to include dimension validation
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
    // Check dimension limits for dimension fields
    if (['length', 'width', 'height'].includes(name)) {
      checkDimensionLimits(name, value);
    }
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f && f.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  // Price calculation logic (now uses adminSettings)
  const getPriceComponents = () => {
    if (!adminSettings || !form) {
      return {
        baseCost: 0,
        materialSurcharge: 0,
        urgencyFees: 0,
        subtotal: 0,
        shipping: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
        totalBeforeGst: 0,
        discount: 0,
        discountLabel: '',
      };
    }
    const quantity = Number(form?.quantity) || 0;
    const palletType = form?.palletType;
    const material = form?.material;
    const urgency = form?.urgency;
    let basePrice = adminSettings.basePalletCost?.[palletType] || 0;
    if (quantity < (adminSettings.minimumOrderQuantity || 1)) {
      basePrice *= 1 + (adminSettings.priceIncreasePercentBelowMinimum || 0) / 100;
    }
    const materialSurcharge = (adminSettings.materialSurcharge?.[material] || 0) * quantity;
    const urgencyFees = (adminSettings.urgencyFee?.[urgency] || 0) * quantity;
    const baseCost = basePrice * quantity;
    const subtotal = baseCost + materialSurcharge + urgencyFees;
    let shipping = 0;
    if (adminSettings.shippingPerPallet) {
      shipping = (adminSettings.shippingEstimate || 0) * quantity;
    } else {
      shipping = adminSettings.shippingEstimate || 0;
    }
    let totalBeforeGst = subtotal + shipping;
    // --- Discount Category Logic ---
    let discount = 0;
    let discountLabel = '';
    const category = form?.discountCategory;
    if (category && adminSettings) {
      let percent = 0;
      if (category === 'VIP') percent = adminSettings.vipDiscountPercent || 0;
      if (category === 'Bulk Orders') percent = adminSettings.bulkOrdersDiscountPercent || 0;
      if (category === 'Special Pricing') percent = adminSettings.specialPricingDiscountPercent || 0;
      if (category === 'Frequent Buyer') percent = adminSettings.frequentBuyerDiscountPercent || 0;
      if (percent > 0) {
        discount = Math.round(subtotal * (percent / 100));
        discountLabel = `${category} Discount (${percent}%)`;
        totalBeforeGst -= discount;
      }
    }
    const cgst = totalBeforeGst * ((adminSettings.cgstPercent || 0) / 100);
    const sgst = totalBeforeGst * ((adminSettings.sgstPercent || 0) / 100);
    const total = totalBeforeGst + cgst + sgst;
    return {
      baseCost: Math.round(baseCost),
      materialSurcharge: Math.round(materialSurcharge),
      urgencyFees: Math.round(urgencyFees),
      subtotal: Math.round(subtotal),
      shipping: Math.round(shipping),
      totalBeforeGst: Math.round(totalBeforeGst),
      cgst: Math.round(cgst),
      sgst: Math.round(sgst),
      total: Math.round(total),
      discount: Math.round(discount),
      discountLabel,
    };
  };
  const priceComponents = getPriceComponents();

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      // Add totalPrice to details
      const updatedDetails = { ...form, totalPrice: priceComponents.total };
      await api.put(`/quotes/${id}`, { details: updatedDetails });
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/quotes/${id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success('Quote updated successfully!');
      navigate('/my-orders');
    } catch (err) {
      toast.error('Failed to update quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || settingsLoading) return <Preloader size={48} fullscreen={false} />;
  if (!form) return <div style={{ color: 'white', padding: '2rem' }}>Quote not found</div>;

  return (
    <div className="simulator-page" style={{ paddingTop: '150px', paddingBottom: '3rem' }}>
      <div className="container-fluid px-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">
              <span className="text-warning">Edit</span> Quotation
            </h1>
            <p className="fs-5 text-light mx-auto" style={{ maxWidth: '800px' }}>
              Update your pallet requirements and see live pricing instantly.
            </p>
          </div>
        </div>
        <div className="row justify-content-center g-4">
          {/* Edit Form */}
          <div className="col-lg-7 col-xl-6">
            <div className="card shadow-lg border-0" style={{ background: '#232b39', color: 'white' }}>
              <div className="card-body p-4">
                <h2 className="h4 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '2rem' }}>
                  <span style={{ fontWeight: 800 }}>Edit Quotation</span>
                </h2>
                <form onSubmit={handleSubmit}>
                  {/* Pallet Specifications */}
                  <h3 className="h5 text-warning mb-3" style={{ fontSize: '1.4rem' }}>Pallet Specifications</h3>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Pallet Type *</label>
                      <select
                        name="palletType"
                        value={form.palletType || ''}
                        onChange={handleChange}
                        className="form-select bg-dark text-white border-0"
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      >
                        <option value="">Select pallet type</option>
                        {palletTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.palletType && <div className="text-danger small">{errors.palletType}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Quantity *</label>
                      <input
                        name="quantity"
                        type="number"
                        value={form.quantity || ''}
                        onChange={handleChange}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter quantity"
                        min="1"
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      />
                      {errors.quantity && <div className="text-danger small">{errors.quantity}</div>}
                      {form.quantity && form.quantity < 20 && (
                        <div className="text-warning small mt-1">
                          Note: For orders below 20 units, a 20% price increase per pallet applies.
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Length <span style={{ color: '#ffc107' }}>(600-2000 mm)</span></label>
                      <input
                        name="length"
                        type="number"
                        value={form.length || ''}
                        onChange={handleChange}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter length"
                        min={600}
                        max={2000}
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      />
                      {errors.length && (
                        <div className="text-danger small">Length must be between 600 and 2000 mm.</div>
                      )}
                      {dimensionWarnings.length && (
                        <div className="text-warning small mt-1">
                          <AlertCircle size={14} className="me-1" />
                          {dimensionWarnings.length}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Width <span style={{ color: '#ffc107' }}>(400-1500 mm)</span></label>
                      <input
                        name="width"
                        type="number"
                        value={form.width || ''}
                        onChange={handleChange}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter width"
                        min={400}
                        max={1500}
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      />
                      {errors.width && (
                        <div className="text-danger small">Width must be between 400 and 1500 mm.</div>
                      )}
                      {dimensionWarnings.width && (
                        <div className="text-warning small mt-1">
                          <AlertCircle size={14} className="me-1" />
                          {dimensionWarnings.width}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Height <span style={{ color: '#ffc107' }}>(100-300 mm)</span></label>
                      <input
                        name="height"
                        type="number"
                        value={form.height || ''}
                        onChange={handleChange}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter height"
                        min={100}
                        max={300}
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      />
                      {errors.height && (
                        <div className="text-danger small">Height must be between 100 and 300 mm.</div>
                      )}
                      {dimensionWarnings.height && (
                        <div className="text-warning small mt-1">
                          <AlertCircle size={14} className="me-1" />
                          {dimensionWarnings.height}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Load Capacity (kg)</label>
                      <input
                        name="loadCapacity"
                        type="number"
                        value={form.loadCapacity || ''}
                        onChange={handleChange}
                        className="form-control bg-dark text-white border-0"
                        placeholder="1000"
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Material *</label>
                      <select
                        name="material"
                        value={form.material || ''}
                        onChange={handleChange}
                        className="form-select bg-dark text-white border-0"
                        style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      >
                        <option value="">Select material</option>
                        {materials.map(material => (
                          <option key={material.value} value={material.value}>{material.label}</option>
                        ))}
                      </select>
                      {errors.material && <div className="text-danger small">{errors.material}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Urgency *</label>
                      <select
                        name="urgency"
                        value={form.urgency || ''}
                        onChange={handleChange}
                        className="form-select bg-dark text-white border-0"
                        style={{ minHeight: '48px', fontSize: '1.4rem', padding: '0.75rem' }}
                        required
                      >
                        <option value="">Select urgency</option>
                        {urgencyOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.urgency && <div className="text-danger small">{errors.urgency}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Attach a pallet design image</label>
                      <div className="custom-file-upload-box d-flex align-items-center w-100" style={{ fontSize: '1.2rem', padding: '0.55rem 0.75rem', minHeight: '48px', border: '1px solid #343a40', borderRadius: '0.25rem' }}>
                        <label htmlFor="palletImage" className="btn btn-link m-0 p-0" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none', boxShadow: 'none' }}>
                          Choose File
                        </label>
                        <span className="ms-3 text-white flex-grow-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file ? file.name : 'No file chosen'}
                        </span>
                        <input
                          id="palletImage"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </div>
                      <div style={{ minHeight: '1.2rem' }}></div>
                    </div>
                  </div>
                  {/* Additional Requirements */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontSize: '1.2rem' }}>Additional Requirements</label>
                    <textarea
                      name="additionalRequirements"
                      value={form.additionalRequirements || ''}
                      onChange={handleChange}
                      rows={4}
                      className="form-control bg-dark text-white border-0"
                      placeholder="Any special requirements or notes..."
                      style={{ fontSize: '1.4rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: '1.2rem', padding: '0.85rem' }}
                    disabled={submitting}
                  >
                    <Send size={22} />
                    {submitting ? 'Updating...' : 'Update Quote'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* Price Calculator */}
          <div className="col-lg-5 col-xl-4 d-flex flex-column">
            <div className="card shadow-lg border-0 h-100" style={{ background: '#232b39', color: 'white', minHeight: '900px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div className="card-body d-flex flex-column" style={{ flex: 1 }}>
                <h2 className="h4 d-flex align-items-center gap-2" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>
                  <Calculator className="text-warning" size={32} />
                  <span style={{ fontWeight: 800 }}>Price Calculator</span>
                </h2>
                <div className="mb-4" style={{ fontSize: '1.15rem' }}>
                  <div className="bg-dark rounded p-3" style={{ color: '#fff' }}>
                    <h5 className="mb-3" style={{ color: '#FFD600', fontWeight: 700, fontSize: '1.4rem' }}>Live Pricing Breakdown</h5>
                    <table className="table table-dark table-bordered mb-0" style={{ background: '#232b39', color: '#fff', borderRadius: '8px', overflow: 'hidden', fontSize: '1.1rem' }}>
                      <tbody>
                        <tr>
                          <td>Base Pallet Cost</td>
                          <td className="text-end">₹{priceComponents.baseCost.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Material Surcharge</td>
                          <td className="text-end">₹{priceComponents.materialSurcharge.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Urgency Fees</td>
                          <td className="text-end">₹{priceComponents.urgencyFees.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Shipping Estimate</td>
                          <td className="text-end">₹{priceComponents.shipping.toLocaleString()}</td>
                        </tr>
                        <tr style={{ fontWeight: 700 }}>
                          <td>Subtotal</td>
                          <td className="text-end">₹{priceComponents.totalBeforeGst.toLocaleString()}</td>
                        </tr>
                        {priceComponents.discount > 0 && (
                          <tr style={{ color: '#4ade80', fontWeight: 700 }}>
                            <td>{priceComponents.discountLabel || 'Discount'}</td>
                            <td className="text-end">-₹{priceComponents.discount.toLocaleString()}</td>
                          </tr>
                        )}
                        <tr>
                          <td>CGST ({adminSettings ? adminSettings.cgstPercent : ''}%)</td>
                          <td className="text-end">₹{priceComponents.cgst.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>SGST ({adminSettings ? adminSettings.sgstPercent : ''}%)</td>
                          <td className="text-end">₹{priceComponents.sgst.toLocaleString()}</td>
                        </tr>
                        <tr style={{ fontWeight: 700, color: '#FFD600' }}>
                          <td>Total (for {form.quantity || 0} units)</td>
                          <td className="text-end">₹{priceComponents.total.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuote; 