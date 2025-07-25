import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, 
  Save, 
  Edit, 
  X, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  Building,
  MapPin,
  Home,
  Star,
  Award,
  Package
} from 'lucide-react';

// Remove tag helpers and Special Taggings UI

const MyInfo = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
  ];

  useEffect(() => {
    if (isOpen && user) {
      fetchUserInfo();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) setIsEditing(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && userInfo === null) {
      setIsEditing(true);
    }
  }, [isOpen, userInfo]);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get(`/user-info/${user.email}`);
      const data = response.data;
      setUserInfo(data);
      // Always check completeness from backend
      const existsResponse = await api.get(`/user-info/${user.email}/exists`);
      setIsComplete(!!existsResponse.data.exists);
      // Do NOT call onComplete here; only update UI
      reset({
        fullName: data.fullName || user.fullName || '',
        email: data.email || user.email || '',
        phone: data.phone || user.phoneNumber || '',
        company: data.company || '',
        address: data.address || '',
        state: data.state || '',
        pincode: data.pincode || ''
      });
    } catch (error) {
      if (error.response?.status === 404) {
        reset({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          company: '',
          address: '',
          state: '',
          pincode: ''
        });
        setUserInfo(null);
        setIsComplete(false);
        // Do NOT call onComplete here
      } else {
        toast.error('Failed to load profile information');
      }
    }
  };

  const onSubmit = async (data) => {
    if (!isEditing) return;
    setIsLoading(true);
    try {
      const userInfoData = {
        userId: user.email,
        ...data
      };
      let response;
      if (userInfo) {
        response = await api.put(`/user-info/${user.email}`, userInfoData);
      } else {
        response = await api.post('/user-info', userInfoData);
      }
      setUserInfo(response.data);
      // After save, check completeness from backend
      const existsResponse = await api.get(`/user-info/${user.email}/exists`);
      setIsComplete(!!existsResponse.data.exists);
      setIsEditing(false);
      if (onComplete && !!existsResponse.data.exists) {
        onComplete(true);
        handleClose();
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data || 'Failed to save profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (userInfo) {
      reset({
        fullName: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        company: userInfo.company,
        address: userInfo.address,
        state: userInfo.state,
        pincode: userInfo.pincode
      });
    }
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  // Prevent Enter from submitting form unless editing
  const handleFormKeyDown = (e) => {
    if (!isEditing && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content p-0 rounded-4 shadow-lg" style={{ background: '#232b39', border: 'none' }}>
          <div className="modal-header border-0 pb-0 align-items-center" style={{ background: 'transparent' }}>
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <User size={28} className="text-warning" />
              <h4 className="mb-0 fw-bold text-white">My Info</h4>
              {isComplete
                ? <CheckCircle size={22} className="ms-2 text-success" title="Profile Complete" />
                : <AlertCircle size={22} className="ms-2 text-danger" title="Profile Incomplete" />}
            </div>
            <button type="button" className="btn btn-link text-white fs-3 p-0 ms-2" onClick={handleClose}>
              <X size={28} />
            </button>
          </div>
          <div className="modal-body pt-0">
            {/* Special Taggings UI removed */}
            {!isComplete && !isEditing && (
              <div
                className="alert alert-warning d-flex align-items-center gap-2 mb-4 myinfo-warning"
                style={{
                  background: 'rgba(255, 193, 7, 0.08)',
                  border: '1px solid #ffe082',
                  color: '#7a5700',
                  fontWeight: 400,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  padding: '0.75rem',
                  borderRadius: '7px',
                  letterSpacing: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} className="text-warning" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 600, color: '#ffc107' }}>Profile Incomplete:</span>
                  <span style={{ marginLeft: 6, color: '#ffc107', fontWeight: 400 }}>
                    Please complete your profile information to request quotations.
                  </span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} autoComplete="off">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-light">Full Name *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><User size={16} /></span>
                    <input {...register('fullName', { required: 'Full name is required' })} type="text" className={`form-control bg-dark text-white border-0 ${errors.fullName ? 'is-invalid' : ''}`} placeholder="Enter your full name" disabled />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light">Email *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><Mail size={16} /></span>
                    <input {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })} type="email" className={`form-control bg-dark text-white border-0 ${errors.email ? 'is-invalid' : ''}`} placeholder="Enter your email" disabled />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light">Phone Number *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><Phone size={16} /></span>
                    <input {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone number must be 10 digits'
                      }
                    })} type="tel" className={`form-control bg-dark text-white border-0 ${errors.phone ? 'is-invalid' : ''}`} placeholder="Enter your phone number" disabled={!isEditing} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light">Company</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><Building size={16} /></span>
                    <input {...register('company')} type="text" className="form-control bg-dark text-white border-0" placeholder="Enter company name (optional)" disabled={!isEditing} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-light">Address *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><Home size={16} /></span>
                    <textarea {...register('address', { required: 'Address is required' })} rows={2} className={`form-control bg-dark text-white border-0 ${errors.address ? 'is-invalid' : ''}`} placeholder="Enter your complete address" disabled={!isEditing} />
                    {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light">State *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><MapPin size={16} /></span>
                    <select {...register('state', { required: 'State is required' })} className={`form-select bg-dark text-white border-0 ${errors.state ? 'is-invalid' : ''}`} disabled={!isEditing}>
                      <option value="">Select your state</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light">Pincode *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-0 text-warning"><MapPin size={16} /></span>
                    <input {...register('pincode', {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Pincode must be 6 digits'
                      }
                    })} type="text" className={`form-control bg-dark text-white border-0 ${errors.pincode ? 'is-invalid' : ''}`} placeholder="Enter pincode" disabled={!isEditing} />
                    {errors.pincode && <div className="invalid-feedback">{errors.pincode.message}</div>}
                  </div>
                </div>
              </div>
              {isEditing && (
                <div className="d-flex gap-3 mt-4 justify-content-end">
                  <button type="submit" disabled={isLoading} className="btn btn-warning fw-bold d-flex align-items-center gap-2 px-4">
                    <Save size={18} /> {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="btn btn-secondary px-4" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </form>
            {!isEditing && (
              <div className="d-flex gap-3 mt-4 justify-content-end">
                <button type="button" className="btn btn-warning fw-bold d-flex align-items-center gap-2 px-4" onClick={handleEdit}>
                  <Edit size={18} /> Edit
                </button>
                <button type="button" className="btn btn-secondary px-4" onClick={handleClose}>Close</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfo; 