import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, Send, Download, Clock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Quotation = () => {
  const [quotes, setQuotes] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
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
    const newQuote = {
      id: `Q${Date.now()}`,
      customerName: data.customerName,
      palletType: data.palletType,
      quantity: data.quantity,
      totalPrice: calculatePrice(),
      status: 'pending',
      createdAt: new Date()
    };

    setQuotes(prev => [newQuote, ...prev]);
    setShowForm(false);
    toast.success('Quotation request submitted successfully!');
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
                  <h2 className="h4 mb-4 d-flex align-items-center gap-2">
                    <FileText className="text-warning" />
                    Request Quotation
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Customer Information */}
                    <h3 className="h5 text-warning mb-3">Customer Information</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Full Name *</label>
                        <input
                          {...register('customerName', { required: 'Name is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your full name"
                        />
                        {errors.customerName && (
                          <div className="text-danger small mt-1">{errors.customerName.message}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          {...register('email', { required: 'Email is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <div className="text-danger small mt-1">{errors.email.message}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone *</label>
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <div className="text-danger small mt-1">{errors.phone.message}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Company</label>
                        <input
                          {...register('company')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter company name (optional)"
                        />
                      </div>
                    </div>
                    {/* Pallet Specifications */}
                    <h3 className="h5 text-warning mb-3">Pallet Specifications</h3>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Pallet Type *</label>
                        <select
                          {...register('palletType', { required: 'Pallet type is required' })}
                          className="form-select bg-dark text-white border-0"
                        >
                          <option value="">Select pallet type</option>
                          {palletTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.palletType && (
                          <div className="text-danger small mt-1">{errors.palletType.message}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          {...register('quantity', { required: 'Quantity is required', min: 1 })}
                          className="form-control bg-dark text-white border-0"
                          placeholder="Enter quantity"
                          min="1"
                        />
                        {errors.quantity && (
                          <div className="text-danger small mt-1">{errors.quantity.message}</div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Length (mm)</label>
                        <input
                          type="number"
                          {...register('length')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1200"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Width (mm)</label>
                        <input
                          type="number"
                          {...register('width')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="800"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Height (mm)</label>
                        <input
                          type="number"
                          {...register('height')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="150"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Load Capacity (kg)</label>
                        <input
                          type="number"
                          {...register('loadCapacity')}
                          className="form-control bg-dark text-white border-0"
                          placeholder="1000"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Material *</label>
                        <select
                          {...register('material', { required: 'Material is required' })}
                          className="form-select bg-dark text-white border-0"
                        >
                          <option value="">Select material</option>
                          {materials.map(material => (
                            <option key={material.value} value={material.value}>
                              {material.label}
                            </option>
                          ))}
                        </select>
                        {errors.material && (
                          <div className="text-danger small mt-1">{errors.material.message}</div>
                        )}
                      </div>
                      <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <label className="form-label">Urgency *</label>
                          <select
                            {...register('urgency', { required: 'Urgency is required' })}
                            className="form-select bg-dark text-white border-0"
                            style={{ minHeight: '48px' }}
                          >
                            <option value="">Select urgency</option>
                            {urgencyOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.urgency && (
                            <div className="text-danger small mt-1">{errors.urgency.message}</div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Attach a pallet design image</label>
                          <div className="custom-file-upload-box d-flex align-items-center w-100">
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
                        </div>
                      </div>
                    </div>
                    {/* Additional Requirements */}
                    <div className="mb-4">
                      <label className="form-label">Additional Requirements</label>
                      <textarea
                        {...register('additionalRequirements')}
                        rows={4}
                        className="form-control bg-dark text-white border-0"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                    >
                      <Send size={20} />
                      Submit Quotation Request
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
          {/* Price Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={showForm ? "col-lg-5 col-xl-4" : "col-12"}
          >
            <div className="card shadow-lg border-0" style={{ background: '#232b39', color: 'white' }}>
              <div className="card-body">
                <h2 className="h4 mb-4 d-flex align-items-center gap-2">
                  <Calculator className="text-warning" />
                  Price Calculator
                </h2>
                <div className="mb-4">
                  <div className="bg-dark rounded p-3 mb-3 price-calc-box">
                    <div className="fw-semibold mb-1" style={{ color: '#fff', fontSize: '1.1rem' }}>Estimated Total</div>
                    <div className="h3 fw-bold text-warning">
                      ₹{calculatePrice().toLocaleString()}
                    </div>
                  </div>
                  {watchedValues.palletType && watchedValues.quantity && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small align-items-center">
                        <span style={{ color: '#e0e6ed' }}>Base Price per Unit:</span>
                        <span className="fw-bold">
                          ₹{palletTypes.find(p => p.value === watchedValues.palletType)?.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between small align-items-center">
                        <span style={{ color: '#e0e6ed' }}>Quantity:</span>
                        <span className="fw-bold">{watchedValues.quantity} units</span>
                      </div>
                      {watchedValues.material && (
                        <div className="d-flex justify-content-between small align-items-center">
                          <span style={{ color: '#e0e6ed' }}>Material:</span>
                          <span className="fw-bold">
                            {materials.find(m => m.value === watchedValues.material)?.label}
                          </span>
                        </div>
                      )}
                      {watchedValues.urgency && (
                        <div className="d-flex justify-content-between small align-items-center">
                          <span style={{ color: '#e0e6ed' }}>Delivery:</span>
                          <span className="fw-bold">
                            {urgencyOptions.find(u => u.value === watchedValues.urgency)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="small bg-dark rounded p-2 price-calc-box price-calc-disclaimer">
                    * Prices are estimates and may vary based on final specifications and market conditions.
                  </div>
                </div>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-warning w-100 mt-3 fw-bold"
                  >
                    New Quotation
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        {/* Quotation History */}
        {quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="row justify-content-center mt-5"
          >
            <div className="col-12">
              <h2 className="h4 mb-4" style={{ color: '#FFD600' }}>Quotation History</h2>
              <div className="row g-3">
                {quotes.map((quote) => (
                  <div key={quote.id} className="col-12">
                    <div className="card shadow-sm mb-3" style={{ background: '#232b39', color: 'white' }}>
                      <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h3 className="h6 mb-0">{quote.id}</h3>
                            <span className={`badge px-2 py-1 ${
                              quote.status === 'pending' ? 'bg-warning text-dark' :
                              quote.status === 'approved' ? 'bg-success' :
                              'bg-danger'
                            }`}>
                              {quote.status === 'pending' && <Clock size={12} className="me-1" />}
                              {quote.status === 'approved' && <CheckCircle size={12} className="me-1" />}
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </div>
                          <div className="small text-white mb-1">
                            Customer: {quote.customerName}
                          </div>
                          <div className="small text-white mb-1">
                            Type: {quote.palletType} • Quantity: {quote.quantity}
                          </div>
                          <div className="small text-white mb-1">
                            Created: {quote.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="h4 text-warning mb-2">
                            ₹{quote.totalPrice.toLocaleString()}
                          </div>
                          <button
                            onClick={() => downloadQuote(quote)}
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quotation;