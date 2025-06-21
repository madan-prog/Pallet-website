import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, Send, Download, Clock, CheckCircle, FileEdit, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Quotation = () => {
  const [quotes, setQuotes] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const palletTypes = [
    { value: 'standard', label: 'Standard Pallet', basePrice: 800 },
    { value: 'euro', label: 'Euro Pallet', basePrice: 950 },
    { value: 'custom', label: 'Custom Design', basePrice: 1200 },
    { value: 'heavy-duty', label: 'Heavy Duty', basePrice: 1500 }
  ];

  const materials = [
    { value: 'pine', label: 'Pine Wood', multiplier: 1.0 },
    { value: 'oak', label: 'Oak Wood', multiplier: 1.8 },
    { value: 'birch', label: 'Birch Wood', multiplier: 1.5 },
    { value: 'recycled', label: 'Recycled Wood', multiplier: 0.7 }
  ];

  const urgencyOptions = [
    { value: 'standard', label: 'Standard (7-10 days)', multiplier: 1.0 },
    { value: 'urgent', label: 'Urgent (3-5 days)', multiplier: 1.3 },
    { value: 'express', label: 'Express (1-2 days)', multiplier: 1.8 }
  ];

  const watchedValues = watch();

  const calculatePrice = () => {
    if (!watchedValues.palletType || !watchedValues.quantity || !watchedValues.material || !watchedValues.urgency) {
      return 0;
    }

    const palletType = palletTypes.find(p => p.value === watchedValues.palletType);
    const material = materials.find(m => m.value === watchedValues.material);
    const urgency = urgencyOptions.find(u => u.value === watchedValues.urgency);

    if (!palletType || !material || !urgency) return 0;

    const basePrice = palletType.basePrice;
    const materialPrice = basePrice * material.multiplier;
    const urgencyPrice = materialPrice * urgency.multiplier;
    const totalPrice = urgencyPrice * watchedValues.quantity;

    return Math.round(totalPrice);
  };

  const onSubmit = (data) => {
    if (editingQuoteId) {
      // Update existing quote
      const updatedQuotes = quotes.map(quote =>
        quote.id === editingQuoteId
          ? { ...quote, ...data, totalPrice: calculatePrice() }
          : quote
      );
      setQuotes(updatedQuotes);
      toast.success('Quotation updated successfully!');
      setEditingQuoteId(null);
    } else {
      // Create new quote
      const newQuote = {
        ...data,
        id: `Q${Date.now()}`,
        totalPrice: calculatePrice(),
        status: 'pending',
        createdAt: new Date()
      };
      setQuotes(prev => [newQuote, ...prev]);
      toast.success('Quotation request submitted successfully!');
    }
    
    setShowForm(false);
    reset();
  };

  const downloadQuote = (quote) => {
    const quoteData = {
      quoteId: quote.id,
      customer: quote.customerName,
      details: {
        palletType: quote.palletType,
        quantity: quote.quantity,
        totalPrice: quote.totalPrice,
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
      reset(quoteToEdit);
      setEditingQuoteId(quoteId);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingQuoteId(null);
    reset();
  };

  const handleNewQuotation = () => {
    setEditingQuoteId(null);
    reset();
    setShowForm(true);
  };

  // Custom dark background style (matches Builder page)
  const darkBgStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #1e293b, #0f172a)', // Matches simulator background
    paddingTop: '80px', // space for navbar
    paddingBottom: '40px',
  };

  return (
    <div style={darkBgStyle}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 text-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="display-4 mb-2" style={{ color: '#FFD600', fontWeight: 700 }}>
                Instant <span style={{ color: 'white' }}>Quotation</span>
              </h1>
              <p className="lead text-secondary">
                Get accurate pricing for your pallet requirements with our advanced quotation system
              </p>
            </motion.div>
          </div>
        </div>
        <div className="row justify-content-center g-4">
          {/* Quotation Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-lg-7 col-xl-6"
            >
              <div className="card shadow-lg border-0" style={{ background: '#232b39', color: 'white' }}>
                <div className="card-body p-4">
                  <h2 className="h4 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '2rem' }}>
                    <FileText className="text-warning" size={32} />
                    <span style={{ fontWeight: 800 }}>Request Quotation</span>
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Customer Information */}
                    <h3 className="h5 text-warning mb-3" style={{ fontSize: '1.4rem' }}>Customer Information</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Full Name *</label>
                        <input
                          {...register('customerName', { required: 'Name is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your full name"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.customerName && (
                            <span>{errors.customerName.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Email *</label>
                        <input
                          type="email"
                          {...register('email', { required: 'Email is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your email"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.email && (
                            <span>{errors.email.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Phone *</label>
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your phone number"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.phone && (
                            <span>{errors.phone.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Company</label>
                        <input
                          {...register('company')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter company name (optional)"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                      </div>
                    </div>
                    {/* Pallet Specifications */}
                    <h3 className="h5 text-warning mb-3" style={{ fontSize: '1.4rem' }}>Pallet Specifications</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Pallet Type *</label>
                        <select
                          {...register('palletType', { required: 'Pallet type is required' })}
                          className="form-select bg-dark text-white border-0"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
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
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                        <div className="text-danger small mt-1" style={{ minHeight: '1.2rem' }}>
                          {errors.quantity && (
                            <span>{errors.quantity.message}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Length (mm)</label>
                        <input
                          type="number"
                          {...register('length')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1200"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Width (mm)</label>
                        <input
                          type="number"
                          {...register('width')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="800"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Height (mm)</label>
                        <input
                          type="number"
                          {...register('height')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="150"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Load Capacity (kg)</label>
                        <input
                          type="number"
                          {...register('loadCapacity')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1000"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '1.2rem' }}>Material *</label>
                        <select
                          {...register('material', { required: 'Material is required' })}
                          className="form-select bg-dark text-white border-0"
                          style={{ fontSize: '1.2rem', padding: '0.75rem' }}
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
                          style={{ minHeight: '48px', fontSize: '1.2rem', padding: '0.75rem' }}
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
                        <div className="custom-file-upload-box d-flex align-items-center w-100" style={{ fontSize: '1.2rem', padding: '0.75rem', minHeight: '48px', border: '1px solid #343a40', borderRadius: '0.25rem' }}>
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
                        style={{ fontSize: '1.2rem' }}
                      />
                    </div>
                    <div className="d-flex gap-3">
                      <button
                        type="submit"
                        className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '1.2rem', padding: '0.85rem' }}
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
              className={showForm ? "col-lg-5 col-xl-4 d-flex flex-column" : "col-12"}
            >
              <div className="card shadow-lg border-0 h-100" style={{ background: '#232b39', color: 'white', minHeight: '900px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
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
                            <td className="text-end">₹{palletTypes.find(p => p.value === watchedValues.palletType)?.basePrice?.toLocaleString() || '0'}</td>
                          </tr>
                          <tr>
                            <td>Material Surcharge</td>
                            <td className="text-end">₹{watchedValues.palletType && watchedValues.material ? (palletTypes.find(p => p.value === watchedValues.palletType)?.basePrice * ((materials.find(m => m.value === watchedValues.material)?.multiplier || 1) - 1)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</td>
                          </tr>
                          <tr>
                            <td>Urgency Fees</td>
                            <td className="text-end">₹{watchedValues.palletType && watchedValues.material && watchedValues.urgency ? ((palletTypes.find(p => p.value === watchedValues.palletType)?.basePrice * (materials.find(m => m.value === watchedValues.material)?.multiplier || 1)) * ((urgencyOptions.find(u => u.value === watchedValues.urgency)?.multiplier || 1) - 1)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</td>
                          </tr>
                          <tr>
                            <td>Shipping Estimate</td>
                            <td className="text-end">₹{watchedValues.quantity ? (watchedValues.quantity * 25).toLocaleString() : '0'}</td>
                          </tr>
                          <tr style={{ fontWeight: 700, color: '#FFD600' }}>
                            <td>Total (for {watchedValues.quantity || 0} units)</td>
                            <td className="text-end">₹{calculatePrice().toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Estimated Total SECOND */}
                  <div className="bg-dark rounded p-3 mb-3 price-calc-box" style={{ fontSize: '1.5rem' }}>
                    <div className="fw-semibold mb-1" style={{ color: '#fff', fontSize: '1.3rem' }}>Estimated Total</div>
                    <div className="h3 fw-bold text-warning" style={{ fontSize: '2.2rem' }}>
                      ₹{calculatePrice().toLocaleString()}
                    </div>
                  </div>
                  {/* Disclaimer LAST */}
                  <div className="small bg-dark rounded p-2 price-calc-box price-calc-disclaimer" style={{ fontSize: '1.1rem', color: '#FFD600' }}>
                    * Prices are estimates and may vary based on final specifications and market conditions.
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="col-lg-5 col-xl-4 col-12"
            >
              <div className="card shadow-lg border-0 text-center" style={{ background: '#232b39', color: 'white', padding: '2.5rem 1.5rem' }}>
                <div className="card-body">
                  <h2 className="h3 mb-3" style={{ color: '#FFD600', fontWeight: 800 }}>Thank you for quoting!</h2>
                  <p className="lead mb-4" style={{ color: '#e0e6ed', fontWeight: 500 }}>
                    "Great things in business are never done by one person. They're done by a team of people."<br/>
                    <span style={{ fontSize: '1rem', color: '#FFD600', fontWeight: 600 }}>– Steve Jobs</span>
                  </p>
                  <button
                    onClick={handleNewQuotation}
                    className="btn btn-warning w-100 mt-3 fw-bold"
                  >
                    New Quotation
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        {/* Quotation History */}
        {quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="row justify-content-center mt-5"
          >
            <div className="col-12 d-flex justify-content-center">
              <div style={{ width: '100%', maxWidth: '1050px' }}>
                <h2 className="h4 mb-4" style={{ color: '#FFD600', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px' }}>Quotation History</h2>
                <div className="row g-3">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="col-12">
                      <div className="card shadow-sm mb-3" style={{ background: '#232b39', color: 'white', fontSize: '1.25rem', fontWeight: 500, letterSpacing: '0.2px', maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                          <div className="d-flex flex-row align-items-center flex-grow-1" style={{ gap: '2.5rem' }}>
                            <div style={{ minWidth: '220px', textAlign: 'left' }}>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <h3 className="h6 mb-0" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{quote.id}</h3>
                                <span className={`badge px-2 py-1 ${
                                  quote.status === 'pending' ? 'bg-warning text-dark' :
                                  quote.status === 'approved' ? 'bg-success' :
                                  'bg-danger'
                                }`} style={{ fontSize: '1rem', fontWeight: 700 }}>
                                  {quote.status === 'pending' && <Clock size={14} className="me-1" />}
                                  {quote.status === 'approved' && <CheckCircle size={14} className="me-1" />}
                                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'left', marginLeft: '20px' }}>
                              <div className="small text-white mb-1" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                Customer: <span style={{ fontWeight: 700 }}>{quote.customerName}</span>
                              </div>
                              <div className="small text-white mb-1" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                Type: <span style={{ fontWeight: 700 }}>{quote.palletType}</span> • Quantity: <span style={{ fontWeight: 700 }}>{quote.quantity}</span>
                              </div>
                              <div className="small text-white mb-1" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                Created: <span style={{ fontWeight: 700 }}>{quote.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end" style={{ minWidth: '270px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div className="h4 text-warning mb-2" style={{ fontSize: '2rem', fontWeight: 800 }}>
                              ₹{quote.totalPrice.toLocaleString()}
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleEdit(quote.id)}
                                className="btn btn-info btn-sm d-flex align-items-center gap-2"
                                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                              >
                                <FileEdit size={18} />
                                Edit
                              </button>
                              <button
                                onClick={() => downloadQuote(quote)}
                                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                              >
                                <Download size={18} />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quotation;