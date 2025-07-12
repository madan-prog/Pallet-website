import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, Send, Download, Clock, CheckCircle, FileEdit, X, User, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import MyInfo from './MyInfo';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

const Quotation = () => {
  const [quotes, setQuotes] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [showMyInfo, setShowMyInfo] = useState(false);
  const [userInfoComplete, setUserInfoComplete] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const { user } = useAuth();
  const { settings: adminSettings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserInfo();
    }
  }, [user]);

  useEffect(() => {
    const editId = localStorage.getItem('editQuoteId');
    if (editId && quotes.length > 0) {
      handleEdit(editId);
      localStorage.removeItem('editQuoteId');
    }
  }, [quotes]);

  useEffect(() => {
    async function fetchQuotes() {
      if (!user) return;
      try {
        const res = await api.get(`/quotes/user/${user.email}`);
        setQuotes(res.data || []);
      } catch (err) {
        toast.error('Failed to fetch quotes');
      }
    }
    fetchQuotes();
  }, [user]);

  const checkUserInfo = async () => {
    try {
      const response = await api.get(`/user-info/${user.email}/exists`);
      const exists = response.data.exists;
      setUserInfoComplete(exists);
      
      if (exists) {
        // Fetch user info for auto-population
        const userInfoResponse = await api.get(`/user-info/${user.email}`);
        setUserInfo(userInfoResponse.data);
      }
    } catch (error) {
      console.error('Error checking user info:', error);
      setUserInfoComplete(false);
    }
  };

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

  const watchedValues = watch();

  const getPriceComponents = () => {
    if (!adminSettings) {
      return {
        baseCost: 0, materialSurcharge: 0, urgencyFees: 0, subtotal: 0, shipping: 0, cgst: 0, sgst: 0, total: 0, totalBeforeGst: 0,
      };
    }
    const quantity = watchedValues.quantity || 0;
    const palletType = watchedValues.palletType;
    const material = watchedValues.material;
    const urgency = watchedValues.urgency;
    // Base cost per pallet type
    let basePrice = adminSettings.basePalletCost?.[palletType] || 0;
    // If quantity < minimum, increase price per pallet
    if (quantity < (adminSettings.minimumOrderQuantity || 1)) {
      basePrice *= 1 + (adminSettings.priceIncreasePercentBelowMinimum || 0) / 100;
    }
    // Material surcharge
    const materialSurcharge = (adminSettings.materialSurcharge?.[material] || 0) * quantity;
    // Urgency fee
    const urgencyFees = (adminSettings.urgencyFee?.[urgency] || 0) * quantity;
    // Base cost
    const baseCost = basePrice * quantity;
    // Subtotal
    const subtotal = baseCost + materialSurcharge + urgencyFees;
    // Shipping
    let shipping = 0;
    if (adminSettings.shippingPerPallet) {
      shipping = (adminSettings.shippingEstimate || 0) * quantity;
    } else {
      shipping = adminSettings.shippingEstimate || 0;
    }
    const totalBeforeGst = subtotal + shipping;
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
    };
  };

  const priceComponents = getPriceComponents();

  const calculatePrice = () => priceComponents.total;

  const onSubmit = async (data) => {
    console.log('onSubmit called', { editingQuoteId, showForm, data });
    if (submitting) {
      console.log('Submission blocked: already submitting');
      return;
    }
    if (!userInfoComplete) {
      toast.error('Please complete your profile in My Info before requesting a quote.');
      setShowMyInfo(true);
      return;
    }
    setSubmitting(true);
    try {
      const quoteDetails = {
        ...data,
        totalPrice: calculatePrice(),
        customerName: userInfo?.fullName,
        email: userInfo?.email,
        phone: userInfo?.phone,
        company: userInfo?.company,
        address: userInfo?.address,
        state: userInfo?.state,
        pincode: userInfo?.pincode
      };
      if (editingQuoteId) {
        try {
          const res = await api.put(`/quotes/${editingQuoteId}`, { details: quoteDetails });
          console.log('PUT response:', res);
          toast.success('Quotation updated successfully!');
          setShowForm(false);
          reset();
        } catch (err) {
          console.error('PUT error:', err);
          toast.error('Failed to submit quotation. Please try again.');
        }
        setEditingQuoteId(null); // Always clear after update attempt
        setSubmitting(false);
        return;
      }
      const quote = {
        userId: user?.email,
        details: quoteDetails,
      };
      const response = await api.post('/quotes', quote);
      console.log('POST response:', response);
      let savedQuote = response.data;
      if (!savedQuote || !savedQuote.id) {
        toast.error('Failed to submit quotation. Please try again.');
        setSubmitting(false);
        return;
      }
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('file', uploadedImage);
        try {
          const uploadRes = await api.post(`/quotes/${savedQuote.id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('File upload response:', uploadRes);
          toast.success('Quotation request submitted successfully!');
        } catch (err) {
          console.error('File upload error:', err);
          toast.error('File upload failed, but your quotation was submitted.');
        }
        setUploadedImage(null);
        setImagePreview(null);
      } else {
        toast.success('Quotation request submitted successfully!');
      }
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('General onSubmit error:', error);
      toast.error('Failed to submit quotation. Please try again.');
    }
    setSubmitting(false);
  };

  const downloadQuote = (quote) => {
    const quoteData = {
      quoteId: quote.id,
      customer: quote.details?.customerName,
      details: {
        palletType: quote.details?.palletType,
        quantity: quote.details?.quantity,
        totalPrice: quote.details?.totalPrice,
        status: quote.status
      },
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(quoteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-${quote.id}.json`;
    link.click();
    
    toast.success('Quote downloaded successfully!');
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error('File size should be less than 2MB');
        e.target.value = '';
        setUploadedImage(null);
        return;
      }
      setUploadedImage(file);
      setImagePreview(null); // No preview
    } else {
      setUploadedImage(null);
      setImagePreview(null);
    }
  };

  const handleEdit = (quoteId) => {
    const quoteToEdit = quotes.find(q => q.id === quoteId);
    if (quoteToEdit) {
      reset(quoteToEdit.details);
      setEditingQuoteId(quoteId);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingQuoteId(null);
    reset();
    navigate('/my-orders');
  };

  const handleNewQuotation = () => {
    setEditingQuoteId(null);
    reset({
      palletType: '',
      quantity: '',
      length: '',
      width: '',
      height: '',
      loadCapacity: '',
      material: '',
      urgency: '',
      additionalRequirements: ''
    });
    setUploadedImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleMyInfoComplete = (complete) => {
    setUserInfoComplete(complete);
    if (complete) {
      checkUserInfo(); // Refresh user info data
    }
  };

  if (settingsLoading) return <div>Loading pricing settings...</div>;

  return (
    <div className="container-fluid simulator-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      {/* Page Heading */}
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold mb-3">
          <span style={{ color: '#FFD600' }}>Instant</span> <span style={{ color: '#fff' }}>Quotation</span>
        </h1>
        <div className="mt-2" style={{ color: '#e0e6ed', fontSize: '1.2rem', fontWeight: 400 }}>
          Get accurate pricing for your pallet requirements with our advanced quotation system
        </div>
      </div>
      <div className="container py-5">
        <div className="row justify-content-center g-4 flex-nowrap equal-height-cards">
          {/* Quotation Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-lg-8 col-xl-8"
              style={{ minWidth: 0 }}
            >
              <div className="card shadow-lg border-0" style={{ background: '#232b39', color: 'white', maxWidth: 900, margin: 'auto' }}>
                <div className="card-body p-4">
                  <h2 className="h4 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '2rem' }}>
                    <FileText className="text-warning" size={32} />
                    <span style={{ fontWeight: 800 }}>Request Quotation</span>
                  </h2>

                  {/* User Info Validation Alert */}
                  {!userInfoComplete && (
                    <div className="mb-4 p-4 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <AlertCircle size={20} />
                        <span className="font-semibold">Profile Required</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Please complete your profile details in My Info before requesting a quote.
                      </p>
                      <button
                        onClick={() => setShowMyInfo(true)}
                        className="btn btn-warning btn-sm d-flex align-items-center gap-2"
                      >
                        <User size={16} />
                        Complete My Info
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Pallet Specifications */}
                    <h3 className="h5 text-warning mb-3" style={{ fontSize: '1.4rem' }}>Pallet Specifications</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Pallet Type *</label>
                        <select
                          {...register('palletType', { required: 'Pallet type is required' })}
                          className="form-select bg-dark text-white border-0"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        >
                          <option value="">Select pallet type</option>
                          {palletTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.palletType && (
                            <span>{errors.palletType.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Quantity *</label>
                        <input
                          type="number"
                          {...register('quantity', { required: 'Quantity is required', min: 1 })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter quantity"
                          min="1"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        />
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.quantity && (
                            <span>{errors.quantity.message}</span>
                          )}
                        </div>
                        {/* Info message for small quantity */}
                        {watchedValues.quantity && adminSettings && watchedValues.quantity < (adminSettings.minimumOrderQuantity || 1) && (
                          <div className="text-warning small mt-1">
                            Note: For orders below {adminSettings.minimumOrderQuantity} units, a {adminSettings.priceIncreasePercentBelowMinimum}% price increase per pallet applies.
                          </div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Length (mm)</label>
                        <input
                          type="number"
                          {...register('length')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1200"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Width (mm)</label>
                        <input
                          type="number"
                          {...register('width')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="800"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Height (mm)</label>
                        <input
                          type="number"
                          {...register('height')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="150"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Load Capacity (kg)</label>
                        <input
                          type="number"
                          {...register('loadCapacity')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1000"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Material *</label>
                        <select
                          {...register('material', { required: 'Material is required' })}
                          className="form-select bg-dark text-white border-0"
                          style={{ fontSize: '1.4rem', padding: '0.75rem' }}
                        >
                          <option value="">Select material</option>
                          {materials.map(material => (
                            <option key={material.value} value={material.value}>
                              {material.label}
                            </option>
                          ))}
                        </select>
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.material && (
                            <span>{errors.material.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Urgency *</label>
                        <select
                          {...register('urgency', { required: 'Urgency is required' })}
                          className="form-select bg-dark text-white border-0"
                          style={{ minHeight: '48px', fontSize: '1.4rem', padding: '0.75rem' }}
                        >
                          <option value="">Select urgency</option>
                          {urgencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.urgency && (
                            <span>{errors.urgency.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Attach a pallet design image</label>
                        <div className="custom-file-upload-box d-flex align-items-center w-100" style={{ fontSize: '1.2rem', padding: '0.55rem 0.75rem', minHeight: '48px', border: '1px solid #343a40', borderRadius: '0.25rem' }}>
                          <label htmlFor="palletImage" className="btn btn-link m-0 p-0" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none', boxShadow: 'none' }}>
                            Choose File
                          </label>
                          <span className="ms-3 text-white flex-grow-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {uploadedImage ? uploadedImage.name : 'No file chosen'}
                          </span>
                          <input
                            id="palletImage"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onImageChange}
                          />
                        </div>
                        <div style={{ minHeight: '1.2rem' }}></div>
                      </div>
                    </div>
                    {/* Additional Requirements */}
                    <div className="mb-4">
                      <label className="form-label" style={{ fontSize: '1.2rem' }}>Additional Requirements</label>
                      <textarea
                        {...register('additionalRequirements')}
                        rows={4}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Any special requirements or notes..."
                        style={{ fontSize: '1.4rem' }}
                      />
                    </div>
                    <div className="d-flex gap-3">
                      <button
                        type="submit"
                        className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '1.2rem', padding: '0.85rem' }}
                        disabled={!userInfoComplete}
                      >
                        {editingQuoteId ? <FileEdit size={22} /> : <Send size={22} />}
                        {editingQuoteId ? 'Update Quotation' : 'Submit Quotation Request'}
                      </button>
                      {editingQuoteId && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn btn-secondary fw-bold d-flex align-items-center justify-content-center gap-2"
                          style={{ fontSize: '1.2rem', padding: '0.85rem' }}
                        >
                          <X size={22} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
          {/* Price Calculator */}
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={showForm ? "col-lg-4 col-xl-4 d-flex flex-column" : "col-12"}
              style={{ minWidth: 0 }}
            >
              <div className="card shadow-lg border-0 h-100" style={{ background: '#232b39', color: 'white', minHeight: '900px', maxWidth: 800, margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div className="card-body d-flex flex-column" style={{ flex: 1 }}>
                  {/* Price Calculator Heading */}
                  <h2 className="h4 d-flex align-items-center gap-2" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>
                    <Calculator className="text-warning" size={32} />
                    <span style={{ fontWeight: 800 }}>Price Calculator</span>
                  </h2>
                  {/* Live Pricing Breakdown Table FIRST */}
                  <div className="mb-4" style={{ fontSize: '1.15rem' }}>
                    <div className="bg-dark rounded p-3" style={{ color: '#fff' }}>
                      <h5 className="mb-3" style={{ color: '#FFD600', fontWeight: 700, fontSize: '1.4rem' }}>Live Pricing Breakdown</h5>
                      <table className="table table-dark table-bordered mb-0" style={{ background: '#232b39', color: '#fff', borderRadius: '8px', overflow: 'hidden', fontSize: '1.1rem' }}>
                        <tbody>
                          <tr>
                            <td>Base Pallet Cost</td>
                            <td className="text-end">₹{(priceComponents.baseCost ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>Material Surcharge</td>
                            <td className="text-end">₹{(priceComponents.materialSurcharge ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>Urgency Fees</td>
                            <td className="text-end">₹{(priceComponents.urgencyFees ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>Shipping Estimate</td>
                            <td className="text-end">₹{(priceComponents.shipping ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr style={{ fontWeight: 700 }}>
                            <td>Subtotal</td>
                            <td className="text-end">₹{(priceComponents.totalBeforeGst ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>CGST ({adminSettings ? adminSettings.cgstPercent : ''}%)</td>
                            <td className="text-end">₹{(priceComponents.cgst ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>SGST ({adminSettings ? adminSettings.sgstPercent : ''}%)</td>
                            <td className="text-end">₹{(priceComponents.sgst ?? 0).toLocaleString()}</td>
                          </tr>
                          <tr style={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFD600' }}>
                            <td>Total</td>
                            <td className="text-end">₹{(priceComponents.total ?? 0).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Additional Info */}
                  <div className="mt-auto">
                    <div className="bg-dark rounded p-3" style={{ color: '#fff' }}>
                      <h6 className="mb-2" style={{ color: '#FFD600', fontWeight: 600 }}>Important Notes:</h6>
                      <ul className="mb-0" style={{ fontSize: '0.9rem', color: '#e0e6ed' }}>
                        <li>Prices are estimates and may vary based on final specifications</li>
                        <li>Shipping costs are calculated per pallet</li>
                        <li>
                          GST ({adminSettings ? ((adminSettings.cgstPercent || 0) + (adminSettings.sgstPercent || 0)) : ''}%) is applicable on all orders
                        </li>
                        <li>
                          Payment terms: {adminSettings ? adminSettings.paymentTermsNotes : ''}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="col-lg-5 col-xl-4 col-12 d-flex justify-content-center"
                style={{ margin: '2.5rem auto 0 auto', display: 'block', minHeight: '350px' }}
              >
                <div className="card shadow-lg border-0 text-center" style={{ background: '#232b39', color: 'white', maxWidth: 700, width: 700, minHeight: 220, padding: '2rem 1.2rem', border: '1.5px solid #FFD600' }}>
                  <div className="card-body">
                    <h2 className="h2 mb-4" style={{ color: '#FFD600', fontWeight: 900, fontSize: '2.7rem', letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.12)', WebkitTextStroke: '0.5px #FFD600', background: 'none', display: 'inline-block' }}>Thank you for quoting!</h2>
                    <div className="mb-4" style={{ color: '#e0e6ed', fontSize: '1rem' }}>
                      You will receive further communications and updates from our team regarding your quotation. Thank you for choosing Saravana Timbers!
                    </div>
                    <button
                      onClick={handleNewQuotation}
                      className="btn btn-warning px-4 py-2 mt-2 fw-bold"
                      style={{ fontSize: '1.1rem', width: 'auto', minWidth: 180 }}
                    >
                      New Quotation
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* MyInfo Modal */}
      <MyInfo 
        isOpen={showMyInfo} 
        onClose={() => setShowMyInfo(false)}
        onComplete={handleMyInfoComplete}
      />
    </div>
  );
};

export default Quotation;