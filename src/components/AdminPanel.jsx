import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, TrendingUp, DollarSign, 
  FileText, Settings, Bell, Download,
  Calendar, Clock, CheckCircle, AlertTriangle,
  Image, File, Trash2, X, Truck, Loader2, Eye, XCircle, Search, Play, Hammer
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { api, getAdminOrders, updateAdminOrderStatus, getAdminOrderById } from '../context/AuthContext';
import Modal from 'react-modal';
import SettingsForm from './SettingsForm';
import './AdminPanel.css';
import { jsPDF } from 'jspdf';
import Preloader from './Preloader';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const stompClientRef = useRef(null);
  
  const stats = {
    totalOrders: 1247,
    totalRevenue: 2850000,
    activeCustomers: 342,
    palletsSold: 15680,
    pendingQuotes: 23,
    completedOrders: 1156
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'ABC Logistics',
      palletType: 'Euro Pallet',
      quantity: 50,
      amount: 47500,
      status: 'processing',
      date: new Date('2024-01-15')
    },
    {
      id: 'ORD-002',
      customer: 'XYZ Warehousing',
      palletType: 'Heavy Duty',
      quantity: 25,
      amount: 46250,
      status: 'completed',
      date: new Date('2024-01-14')
    },
    {
      id: 'ORD-003',
      customer: 'Global Shipping Co.',
      palletType: 'Standard Pallet',
      quantity: 100,
      amount: 80000,
      status: 'pending',
      date: new Date('2024-01-13')
    },
    {
      id: 'ORD-004',
      customer: 'Metro Distribution',
      palletType: 'Custom Pallet',
      quantity: 30,
      amount: 36000,
      status: 'processing',
      date: new Date('2024-01-12')
    }
  ];

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Orders tab state
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderSortBy, setOrderSortBy] = useState('date_desc');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('');
  const [quoteDateFilter, setQuoteDateFilter] = useState('');

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 8;

  const allQuoteFields = [
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type' },
    { key: 'qty', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'date', label: 'Date' },
    { key: 'files', label: 'Files' },
  ];
  const [visibleQuoteFields, setVisibleQuoteFields] = useState(allQuoteFields.map(f => f.key));

  // Add to Admin component state:
  const [quoteNotes, setQuoteNotes] = useState({});
  const [noteInput, setNoteInput] = useState('');
  const [newQuoteCount, setNewQuoteCount] = useState(0);

  useEffect(() => {
    fetchQuotes();
    connectWebSocket();
    if (activeTab === 'orders') {
      fetchOrders();
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
    // eslint-disable-next-line
  }, [activeTab]);

  useEffect(() => { setCurrentPage(1); }, [quoteSearchTerm, quoteStatusFilter, quoteDateFilter, sortBy]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quotes/all');
      setQuotes(res.data);
    } catch (err) {
      // Optionally show error
    }
    setLoading(false);
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/quotes', (message) => {
          const quote = JSON.parse(message.body);
          fetchQuotes();
          if (quote.status === 'pending') {
            setNewQuoteCount((prev) => prev + 1);
            toast.success(`New quote submitted by ${quote.details?.customerName || quote.userId}`);
          } else if (quote.status === 'cancelled') {
            toast.error(`Quote ${quote.quoteId} was cancelled by customer.`);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-subtle text-warning';
      case 'processing': return 'bg-primary-subtle text-primary';
      case 'completed': return 'bg-success-subtle text-success';
      case 'cancelled': return 'bg-danger-subtle text-danger';
      default: return 'bg-secondary-subtle text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={12} />;
      case 'processing': return <AlertTriangle size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const tabs = [
    // { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={16} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={16} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
    { id: 'quotes', label: 'Quotes', icon: <FileText size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  // Filtering, searching, and sorting logic
  const filteredQuotes = quotes
    .filter(q => {
      if (quoteStatusFilter === 'all') return true;
        return q.status === quoteStatusFilter;
    })
    .filter(q => {
      const customer = q.details?.customerName?.toLowerCase() || '';
      const quoteId = q.quoteId?.toLowerCase() || '';
      return (
        customer.includes(quoteSearchTerm.toLowerCase()) ||
        quoteId.includes(quoteSearchTerm.toLowerCase())
      );
    })
    .filter(q => {
      if (!quoteDateFilter) return true;
      const quoteDate = q.createdAt ? new Date(q.createdAt).toISOString().slice(0, 10) : '';
      return quoteDate === quoteDateFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'date_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'amount_desc') {
        return (b.details?.totalPrice || 0) - (a.details?.totalPrice || 0);
      } else if (sortBy === 'amount_asc') {
        return (a.details?.totalPrice || 0) - (b.details?.totalPrice || 0);
      } else if (sortBy === 'customer_asc') {
        return (a.details?.customerName || '').localeCompare(b.details?.customerName || '');
      } else if (sortBy === 'customer_desc') {
        return (b.details?.customerName || '').localeCompare(a.details?.customerName || '');
      } else {
        return 0;
      }
    });

  // Calculate paginated quotes
  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * quotesPerPage, currentPage * quotesPerPage);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const getFileIcon = (fileName) => {
    if (isImageFile(fileName)) {
      return <Image size={16} className="text-primary" />;
    }
    return <File size={16} className="text-secondary" />;
  };

  const handleFileDownload = (quoteId, fileName) => {
    const downloadUrl = `http://localhost:8080/api/quotes/files/${quoteId}/${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
  };

  const handleFilePreview = (quoteId, fileName) => {
    if (isImageFile(fileName)) {
      const imageUrl = `http://localhost:8080/api/quotes/files/${quoteId}/${encodeURIComponent(fileName)}`;
      window.open(imageUrl, '_blank');
    } else {
      handleFileDownload(quoteId, fileName);
    }
  };

  const handleStatusUpdate = async (quoteId, newStatus) => {
    try {
      await api.patch(`/quotes/${quoteId}/status?status=${newStatus}`);
      toast.success(`Quote ${newStatus} successfully`);
      fetchQuotes();
    } catch (err) {
      toast.error(`Failed to ${newStatus} quote`);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await getAdminOrders();
      setOrders(res.data);
      // Debug: log all order statuses
      if (Array.isArray(res.data)) {
        console.log('Order statuses:', res.data.map(o => o.status));
      }
    } catch (err) {
      setOrdersError('Failed to load orders');
    }
    setOrdersLoading(false);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      if (newStatus === 'dispatched') {
        toast.success('Invoice sent to customer!');
      }
      fetchOrders();
    } catch (err) {
      toast.error(`Failed to update order status`);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const res = await getAdminOrderById(orderId);
      setSelectedOrder(res.data);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load order details');
    }
  };

  // Add delete handler
  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;
    try {
      await api.delete(`/quotes/${quoteId}`);
      toast.success('Quote deleted successfully');
      fetchQuotes();
    } catch (err) {
      toast.error('Failed to delete quote');
    }
  };

  const handleOpenQuoteModal = (quote) => {
    setSelectedQuote(quote);
    setQuoteModalOpen(true);
  };
  const handleCloseQuoteModal = () => {
    setQuoteModalOpen(false);
    setSelectedQuote(null);
  };

  const handleDownloadQuotePDF = (quote) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Quote Details', 14, 18);
    doc.setFontSize(12);
    let y = 30;
    doc.text(`Quote ID: ${quote.quoteId || ''}`, 14, y);
    y += 8;
    doc.text(`Status: ${quote.status || ''}`, 14, y);
    y += 8;
    doc.text(`Date: ${quote.createdAt ? new Date(quote.createdAt).toLocaleString() : ''}`, 14, y);
    y += 12;
    doc.setFontSize(14);
    doc.text('Customer Info', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Name: ${quote.details?.customerName || ''}`, 14, y);
    y += 8;
    doc.text(`Email: ${quote.details?.email || ''}`, 14, y);
    y += 8;
    doc.text(`Phone: ${quote.details?.phone || ''}`, 14, y);
    y += 8;
    doc.text(`Company: ${quote.details?.companyName || ''}`, 14, y);
    y += 8;
    doc.text(`Address: ${quote.details?.address || ''}`, 14, y);
    y += 8;
    doc.text(`State: ${quote.details?.state || ''}`, 14, y);
    y += 8;
    doc.text(`Pincode: ${quote.details?.pincode || ''}`, 14, y);
    y += 12;
    doc.setFontSize(14);
    doc.text('Quote Details', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Pallet Type: ${quote.details?.palletType || ''}`, 14, y);
    y += 8;
    doc.text(`Material: ${quote.details?.material || ''}`, 14, y);
    y += 8;
    doc.text(`Quantity: ${quote.details?.quantity || ''}`, 14, y);
    y += 8;
    doc.text(`Load Capacity: ${quote.details?.loadCapacity || ''}`, 14, y);
    y += 8;
    doc.text(`Length: ${quote.details?.length || ''}`, 14, y);
    y += 8;
    doc.text(`Width: ${quote.details?.width || ''}`, 14, y);
    y += 8;
    doc.text(`Height: ${quote.details?.height || ''}`, 14, y);
    y += 8;
    doc.text(`Urgency: ${quote.details?.urgency || ''}`, 14, y);
    y += 8;
    doc.text(`Additional Requirements: ${quote.details?.additionalRequirements || ''}`, 14, y);
    y += 8;
    doc.text(`Total Price: ₹${quote.details?.totalPrice?.toLocaleString() || ''}`, 14, y);
    y += 8;
    doc.save(`quote-${quote.quoteId || quote.id}.pdf`);
  };

  // Handler for selecting/deselecting a quote
  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => prev.includes(quoteId) ? prev.filter(id => id !== quoteId) : [...prev, quoteId]);
  };

  // Handler for select all
  const handleSelectAllQuotes = () => {
    if (selectedQuotes.length === filteredQuotes.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(filteredQuotes.map(q => q.id));
    }
  };

  // Bulk action handlers
  const handleBulkStatusUpdate = async (newStatus) => {
    for (const quoteId of selectedQuotes) {
      await handleStatusUpdate(quoteId, newStatus);
    }
    setSelectedQuotes([]);
  };
  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the selected quotes? This action cannot be undone.')) return;
    for (const quoteId of selectedQuotes) {
      await handleDeleteQuote(quoteId);
    }
    setSelectedQuotes([]);
  };

  // Load notes from localStorage on mount
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem('adminQuoteNotes') || '{}');
    setQuoteNotes(storedNotes);
  }, []);
  // When opening modal, set note input
  useEffect(() => {
    if (selectedQuote) {
      setNoteInput(quoteNotes[selectedQuote.id] || '');
    }
  }, [selectedQuote, quoteNotes]);
  // Save note handler
  const handleSaveNote = () => {
    const updatedNotes = { ...quoteNotes, [selectedQuote.id]: noteInput };
    setQuoteNotes(updatedNotes);
    localStorage.setItem('adminQuoteNotes', JSON.stringify(updatedNotes));
  };

  // Handler to clear notifications
  const handleBellClick = () => {
    setNewQuoteCount(0);
  };

  return (
    <div className="min-vh-100 simulator-page" style={{paddingTop: '120px', paddingBottom: '40px'}}>
      <div className="container-xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5"
        >
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="display-3 fw-bold mb-2">
                <span className="text-warning">Admin</span> Dashboard
              </h1>
              <p className="fs-4 text-light">
                Manage your pallet manufacturing business
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-dark p-2 rounded-3 border border-secondary position-relative" onClick={handleBellClick}>
                <Bell size={20} className="text-warning" />
                {newQuoteCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: '#dc3545',
                    color: '#fff',
                    borderRadius: '50%',
                    minWidth: 18,
                    height: 18,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    padding: '0 5px',
                    zIndex: 2
                  }}>{newQuoteCount}</span>
                )}
              </button>
              <button className="btn btn-warning d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold text-dark">
                <Download size={16} />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-5"
        >
          <div className="d-flex flex-wrap gap-1 bg-dark p-2 rounded-3 border-secondary">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 fw-semibold ${
                  activeTab === tab.id
                    ? 'bg-warning text-dark'
                    : 'text-light bg-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quotes Tab Content */}
        {activeTab === 'quotes' && (
          <div className="quotes-section">
            <div className="quotes-toolbar">
              <div className="toolbar-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by customer or quote ID"
                  value={quoteSearchTerm}
                  onChange={e => setQuoteSearchTerm(e.target.value)}
                  style={{ minWidth: 220, borderRadius: 12 }}
                />
                <select
                  className="form-select"
                  value={quoteStatusFilter}
                  onChange={e => setQuoteStatusFilter(e.target.value)}
                  style={{ borderRadius: 12, minWidth: 140 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="form-control"
                  value={quoteDateFilter}
                  onChange={e => setQuoteDateFilter(e.target.value)}
                  style={{ borderRadius: 12, minWidth: 140 }}
                />
              </div>
              <div className="toolbar-group">
              <select className="form-select w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ borderRadius: 12, fontWeight: 500, minWidth: 180 }}>
                  <option value="date_desc">Date: Newest First</option>
                  <option value="date_asc">Date: Oldest First</option>
                  <option value="amount_desc">Amount: High-Low</option>
                  <option value="amount_asc">Amount: Low-High</option>
                  <option value="customer_asc">Customer: A-Z</option>
                  <option value="customer_desc">Customer: Z-A</option>
              </select>
            </div>
                  </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle" style={{ borderRadius: '14px', overflow: 'hidden', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#23293a' }}>
                    <th>Quote ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody as={motion.tbody}>
                  {paginatedQuotes.map((quote, idx) => (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.07 }}
                      style={{ background: '#23293a', borderBottom: '1px solid #343a40' }}
                    >
                      <td style={{ color: '#ffc107', fontWeight: 700 }}>{quote.quoteId}</td>
                      <td>{quote.details?.customerName}</td>
                      <td>{quote.details?.palletType}</td>
                      <td>{quote.details?.quantity}</td>
                      <td>₹{quote.details?.totalPrice?.toLocaleString()}</td>
                      <td>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : ''}</td>
                      <td>
                        <span className={`quote-status status-${quote.status}`}>{quote.status === 'approved' && <CheckCircle size={14} />} {quote.status === 'pending' && <Clock size={14} />} {quote.status === 'rejected' && <AlertTriangle size={14} />} {quote.status === 'cancelled' && <X size={14} />} {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                    {quote.status === 'pending' && (
                      <>
                              <button className="action-btn approve" onClick={e => { e.stopPropagation(); handleStatusUpdate(quote.id, 'approved'); }} title="Approve quote">✓</button>
                              <button className="action-btn reject" onClick={e => { e.stopPropagation(); handleStatusUpdate(quote.id, 'rejected'); }} title="Reject quote">✗</button>
                      </>
                    )}
                          <button className="action-btn download" onClick={e => { e.stopPropagation(); handleDownloadQuotePDF(quote); }} title="Download PDF">
                            <Download size={16} />
                          </button>
                          <button className="action-btn delete" onClick={e => { e.stopPropagation(); handleDeleteQuote(quote.id); }} title="Delete quote">
                      <Trash2 size={16} />
                    </button>
                  </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
                <button className="btn btn-outline-warning btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&laquo; Prev</button>
                <span style={{ color: '#ffc107', fontWeight: 500, margin: '0 12px' }}>Page {currentPage} of {totalPages}</span>
                <button className="btn btn-outline-warning btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next &raquo;</button>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card bg-dark text-light border-secondary rounded-4 p-4"
            style={{ boxShadow: '0 6px 32px #0002', border: 'none' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="fs-4 fw-bold mb-0">Orders</h3>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <select
                  className="form-select w-auto"
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in production">In Production</option>
                  <option value="dispatched">Dispatched</option>
                </select>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control w-auto pe-5"
                    placeholder="Search"
                    value={orderSearchTerm}
                    onChange={e => setOrderSearchTerm(e.target.value)}
                    style={{ minWidth: 220 }}
                  />
                  {orderSearchTerm && (
                    <button
                      className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y px-2"
                      style={{ color: '#ffc107', zIndex: 2 }}
                      onClick={() => setOrderSearchTerm('')}
                      tabIndex={-1}
                      title="Clear search"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  <Search size={18} style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', color: '#bfc9d1', pointerEvents: 'none' }} />
                </div>
                <select
                  className="form-select w-auto"
                  value={orderSortBy}
                  onChange={e => setOrderSortBy(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                </select>
              </div>
            </div>
            {/* Summary Row */}
            <div className="mb-3 d-flex gap-4 align-items-center flex-wrap" style={{ fontSize: '1.08rem' }}>
              <span><Package size={18} className="me-1 text-warning" /> <b>{orders.length}</b> Orders</span>
              <span><Hammer size={16} className="me-1 text-primary" /> <b>{orders.filter(o => o.status === 'in production').length}</b> In Production</span>
              <span><Truck size={16} className="me-1 text-info" /> <b>{orders.filter(o => o.status === 'shipped').length}</b> Dispatched</span>
            </div>
            {ordersLoading ? (
              <Preloader size={48} fullscreen={false} />
            ) : ordersError ? (
              <div className="text-danger text-center py-5">{ordersError}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover fs-6 shadow" style={{ borderRadius: '18px', overflow: 'hidden', borderCollapse: 'separate', borderSpacing: 0, boxShadow: '0 2px 16px #0001, 0 1.5px 6px #bfc9d133', tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#23293a' }}>
                      <th className="fw-bold text-center" style={{padding: '14px 10px', minWidth: 160, width: '20%'}}>Customer Name</th>
                      <th className="fw-bold text-center" style={{padding: '14px 10px', minWidth: 180, width: '25%'}}>Order ID</th>
                      <th className="fw-bold text-center" style={{padding: '14px 10px', minWidth: 140, width: '18%'}}>Status</th>
                      <th className="fw-bold text-center" style={{padding: '14px 10px', minWidth: 140, width: '18%'}}>Actions</th>
                      <th className="fw-bold text-center" style={{padding: '14px 10px', minWidth: 120, width: '19%'}}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(order => orderStatusFilter === 'all' || order.status === orderStatusFilter)
                      .filter(order => {
                        const customer = (order.userName || order.userId || '').toLowerCase();
                        const orderId = (order.orderId || '').toLowerCase();
                        return (
                          customer.includes(orderSearchTerm.toLowerCase()) ||
                          orderId.includes(orderSearchTerm.toLowerCase())
                        );
                      })
                      .slice()
                      .sort((a, b) => {
                        if (orderSortBy === 'date_desc') {
                          return new Date(b.createdAt) - new Date(a.createdAt);
                        } else {
                          return new Date(a.createdAt) - new Date(b.createdAt);
                        }
                      })
                      .map((order, idx) => (
                        <tr key={order.id} style={{ background: idx % 2 === 0 ? '#23293a' : '#23293aee', transition: 'background 0.2s', boxShadow: idx % 2 === 0 ? '0 1px 4px #0001' : '0 2px 8px #ffc10722' }}>
                          <td className="align-middle text-center" style={{padding: '12px 10px', minWidth: 160, width: '20%'}}>{order.userName ? order.userName : (order.userId && !order.userId.includes('@') ? order.userId : '')}</td>
                          <td className="align-middle text-center" style={{padding: '12px 10px', minWidth: 180, width: '25%'}}>{order.orderId}</td>
                          <td className="align-middle text-center" style={{padding: '12px 10px', minWidth: 140, width: '18%'}}>
                            <span className={`badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-6 shadow ${order.status === 'pending' ? 'bg-warning text-dark' : order.status === 'in production' ? 'bg-primary' : order.status === 'dispatched' ? 'bg-info text-dark' : order.status === 'approved' ? 'bg-success text-white' : 'bg-light text-dark'}`}
                              style={{ borderRadius: 8, fontWeight: 600, letterSpacing: 0.2, fontSize: '0.93rem', padding: '6px 12px' }}>
                              {order.status === 'approved' && <CheckCircle size={13} className="me-1" />}
                              {order.status === 'in production' && <Hammer size={13} className="me-1" />}
                              {order.status === 'dispatched' && <Truck size={13} className="me-1" />}
                              {order.status === 'pending' && <Loader2 size={13} className="me-1" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="align-middle text-center" style={{width: '18%', minWidth: 140, whiteSpace: 'nowrap', padding: '12px 6px'}}>
                            <div className="d-flex justify-content-center gap-1">
                              {order.status === 'approved' && (
                                <button
                                  className="btn btn-primary px-2 py-1 fw-semibold shadow-sm d-flex align-items-center gap-1"
                                  style={{ minWidth: 90, borderRadius: '8px', fontSize: '0.91rem', letterSpacing: '0.2px', transition: 'background 0.2s', padding: '6px 12px' }}
                                  onClick={() => handleOrderStatusUpdate(order.id, 'in production')}
                                  title="Mark as In Production"
                                >
                                  <Play size={13} className="me-1" /> Mark In Production
                                </button>
                              )}
                              {order.status === 'in production' && (
                                <button
                                  className="btn btn-success px-2 py-1 fw-semibold shadow-sm d-flex align-items-center gap-1"
                                  style={{ minWidth: 90, borderRadius: '8px', fontSize: '0.91rem', letterSpacing: '0.2px', transition: 'background 0.2s', padding: '6px 12px' }}
                                  onClick={() => handleOrderStatusUpdate(order.id, 'dispatched')}
                                  title="Mark as Dispatched"
                                >
                                  <Truck size={13} className="me-1" /> Mark Dispatched
                                </button>
                              )}
                              {order.status !== 'approved' && order.status !== 'in production' && (
                                <span className="text-secondary">-</span>
                              )}
                            </div>
                          </td>
                          <td className="align-middle text-center" style={{width: '19%', minWidth: 120, whiteSpace: 'nowrap', padding: '12px 6px'}}>
                            <div className="d-flex justify-content-center">
                              <button
                                className="btn btn-outline-secondary btn-sm px-2 py-1 fw-semibold view-details-btn d-flex align-items-center gap-1"
                                style={{ minWidth: 70, borderRadius: '7px', fontSize: '0.89rem', background: 'transparent', border: '1.2px solid #bfc9d1', color: '#fff', boxShadow: 'none', transition: 'background 0.2s, border 0.2s, color 0.2s', padding: '5px 10px' }}
                                onClick={() => handleViewOrderDetails(order.id)}
                                title="View Details"
                              >
                                <Eye size={12} className="me-1" /> View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            <Modal
              isOpen={detailsModalOpen}
              onRequestClose={() => setDetailsModalOpen(false)}
              contentLabel="Order Details"
              ariaHideApp={false}
              style={{
                content: {
                  background: '#23293a',
                  color: '#fff',
                  borderRadius: '1rem',
                  maxWidth: '440px',
                  margin: 'auto',
                  padding: '1.2rem',
                  maxHeight: '80vh',
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  bottom: 'auto',
                  transform: 'translate(-50%, -50%)',
                  overflow: 'auto',
                  boxShadow: '0 4px 32px #0005',
                },
                overlay: {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <h4 className="mb-3">Order Details</h4>
              {selectedOrder ? (
                <div style={{ background: '#1a202c', borderRadius: '0.7rem', padding: '1.2rem', color: '#fff', maxHeight: 400, overflow: 'auto', fontSize: '1rem', boxShadow: '0 2px 12px #0002' }}>
                  <div style={{ marginBottom: '1rem', borderBottom: '1px solid #343a40', paddingBottom: '0.7rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Order ID:</span>
                      <span>{selectedOrder.orderId}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Status:</span>
                      <span className={`badge ${selectedOrder.status === 'pending' ? 'bg-warning text-dark' : selectedOrder.status === 'in production' ? 'bg-primary' : selectedOrder.status === 'dispatched' ? 'bg-success' : selectedOrder.status === 'approved' ? 'bg-dark-green text-white' : 'bg-light text-dark'}`}>{selectedOrder.status}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Date:</span>
                      <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem', borderBottom: '1px solid #343a40', paddingBottom: '0.7rem' }}>
                    <div className="fw-bold mb-2" style={{ fontSize: '1.08rem' }}>Customer Info</div>
                    <div className="mb-1"><span className="fw-semibold">Name:</span> {selectedOrder.userName || selectedOrder.customerName}</div>
                    <div className="mb-1"><span className="fw-semibold">Email:</span> {selectedOrder.quoteDetails?.email || selectedOrder.email}</div>
                    <div className="mb-1"><span className="fw-semibold">Phone:</span> {selectedOrder.quoteDetails?.phone || selectedOrder.phone || '-'}</div>
                    <div className="mb-1"><span className="fw-semibold">Company Name:</span> {selectedOrder.quoteDetails?.companyName || '-'}</div>
                    <div className="mb-1"><span className="fw-semibold">Address:</span> {selectedOrder.quoteDetails?.address || '-'}</div>
                    <div className="mb-1"><span className="fw-semibold">State:</span> {selectedOrder.quoteDetails?.state || '-'}</div>
                    <div className="mb-1"><span className="fw-semibold">Pincode:</span> {selectedOrder.quoteDetails?.pincode || '-'}</div>
                  </div>
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: '1.08rem' }}>Quote Details</div>
                    <div className="row g-2">
                      <div className="col-6"><span className="fw-semibold">Pallet Type:</span> {selectedOrder.quoteDetails?.palletType}</div>
                      <div className="col-6"><span className="fw-semibold">Material:</span> {selectedOrder.quoteDetails?.material}</div>
                      <div className="col-6"><span className="fw-semibold">Quantity:</span> {selectedOrder.quoteDetails?.quantity}</div>
                      <div className="col-6"><span className="fw-semibold">Load Capacity:</span> {selectedOrder.quoteDetails?.loadCapacity}</div>
                      <div className="col-6"><span className="fw-semibold">Length:</span> {selectedOrder.quoteDetails?.length}</div>
                      <div className="col-6"><span className="fw-semibold">Width:</span> {selectedOrder.quoteDetails?.width}</div>
                      <div className="col-6"><span className="fw-semibold">Height:</span> {selectedOrder.quoteDetails?.height}</div>
                      <div className="col-6"><span className="fw-semibold">Urgency:</span> {selectedOrder.quoteDetails?.urgency}</div>
                      <div className="col-12"><span className="fw-semibold">Additional Requirements:</span> {selectedOrder.quoteDetails?.additionalRequirements || '-'}</div>
                      <div className="col-12"><span className="fw-semibold">Total Price:</span> ₹{selectedOrder.quoteDetails?.totalPrice?.toLocaleString() || '-'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>Loading...</div>
              )}
              <button className="btn btn-warning mt-3" onClick={() => setDetailsModalOpen(false)}>Close</button>
            </Modal>
          </motion.div>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh' }}
          >
            <SettingsForm />
          </motion.div>
        )}
        <Modal
          isOpen={quoteModalOpen}
          onRequestClose={handleCloseQuoteModal}
          contentLabel="Quote Details"
          ariaHideApp={false}
          style={{
            content: {
              background: '#23293a',
              color: '#fff',
              borderRadius: '1rem',
              maxWidth: '440px',
              margin: 'auto',
              padding: '1.2rem',
              maxHeight: '80vh',
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              overflow: 'auto',
              boxShadow: '0 4px 32px #0005',
            },
            overlay: {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <h4 className="mb-3">Quote Details</h4>
          {selectedQuote ? (
            <div style={{ background: '#1a202c', borderRadius: '0.7rem', padding: '1.2rem', color: '#fff', maxHeight: 400, overflow: 'auto', fontSize: '1rem', boxShadow: '0 2px 12px #0002' }}>
              <div style={{ marginBottom: '1rem', borderBottom: '1px solid #343a40', paddingBottom: '0.7rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Quote ID:</span>
                  <span>{selectedQuote.quoteId}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Status:</span>
                  <span className={`badge ${selectedQuote.status === 'pending' ? 'bg-warning text-dark' : selectedQuote.status === 'approved' ? 'bg-success' : selectedQuote.status === 'rejected' ? 'bg-danger' : selectedQuote.status === 'cancelled' ? 'bg-secondary' : 'bg-light text-dark'}`}>{selectedQuote.status}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Date:</span>
                  <span>{selectedQuote.createdAt ? new Date(selectedQuote.createdAt).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div style={{ marginBottom: '1rem', borderBottom: '1px solid #343a40', paddingBottom: '0.7rem' }}>
                <div className="fw-bold mb-2" style={{ fontSize: '1.08rem' }}>Customer Info</div>
                <div className="mb-1"><span className="fw-semibold">Name:</span> {selectedQuote.details?.customerName}</div>
                <div className="mb-1"><span className="fw-semibold">Email:</span> {selectedQuote.details?.email}</div>
                <div className="mb-1"><span className="fw-semibold">Phone:</span> {selectedQuote.details?.phone || '-'}</div>
                <div className="mb-1"><span className="fw-semibold">Company Name:</span> {selectedQuote.details?.companyName || '-'}</div>
                <div className="mb-1"><span className="fw-semibold">Address:</span> {selectedQuote.details?.address || '-'}</div>
                <div className="mb-1"><span className="fw-semibold">State:</span> {selectedQuote.details?.state || '-'}</div>
                <div className="mb-1"><span className="fw-semibold">Pincode:</span> {selectedQuote.details?.pincode || '-'}</div>
              </div>
              <div>
                <div className="fw-bold mb-2" style={{ fontSize: '1.08rem' }}>Quote Details</div>
                <div className="row g-2">
                  <div className="col-6"><span className="fw-semibold">Pallet Type:</span> {selectedQuote.details?.palletType}</div>
                  <div className="col-6"><span className="fw-semibold">Material:</span> {selectedQuote.details?.material}</div>
                  <div className="col-6"><span className="fw-semibold">Quantity:</span> {selectedQuote.details?.quantity}</div>
                  <div className="col-6"><span className="fw-semibold">Load Capacity:</span> {selectedQuote.details?.loadCapacity}</div>
                  <div className="col-6"><span className="fw-semibold">Length:</span> {selectedQuote.details?.length}</div>
                  <div className="col-6"><span className="fw-semibold">Width:</span> {selectedQuote.details?.width}</div>
                  <div className="col-6"><span className="fw-semibold">Height:</span> {selectedQuote.details?.height}</div>
                  <div className="col-6"><span className="fw-semibold">Urgency:</span> {selectedQuote.details?.urgency}</div>
                  <div className="col-12"><span className="fw-semibold">Additional Requirements:</span> {selectedQuote.details?.additionalRequirements || '-'}</div>
                  <div className="col-12"><span className="fw-semibold">Total Price:</span> ₹{selectedQuote.details?.totalPrice?.toLocaleString() || '-'}</div>
                </div>
                {/* File/Image Preview */}
                <div className="mt-3">
                  <span className="fw-semibold">Files:</span> {selectedQuote.details?.fileName ? (
                    <>
                      {(() => {
                        const fileName = selectedQuote.details.fileName;
                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                        const fileUrl = `http://localhost:8080/api/quotes/files/${selectedQuote.id}/${encodeURIComponent(fileName)}`;
                        if (isImage) {
                          return <img src={fileUrl} alt="Quote File" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, marginTop: 8 }} />;
                        } else {
                          return <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ffc107', marginLeft: 8 }}>{fileName}</a>;
                        }
                      })()}
                    </>
                  ) : 'No files'}
                </div>
                {/* Add to Admin component state: */}
                <div className="mt-4 p-3 rounded" style={{ background: '#23293a', border: '1px solid #343a40' }}>
                  <div className="fw-bold mb-2" style={{ color: '#ffc107' }}>Admin Notes (private)</div>
                  <textarea
                    className="form-control mb-2"
                    rows={3}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add internal notes for this quote..."
                    style={{ background: '#1a202c', color: '#fff', border: '1px solid #343a40', borderRadius: 8 }}
                  />
                  <button className="btn btn-outline-warning btn-sm" onClick={handleSaveNote}>Save Note</button>
                  {quoteNotes[selectedQuote?.id] && (
                    <div className="mt-2 text-light" style={{ fontSize: '0.98rem' }}><strong>Saved Note:</strong> {quoteNotes[selectedQuote.id]}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
          <button className="btn btn-warning mt-3" onClick={handleCloseQuoteModal}>Close</button>
        </Modal>
      </div>
      <style>{`
      .table-hover tbody tr:hover {
        background: #2c3242 !important;
      }
      .view-details-btn, .view-details-btn:disabled {
        color: #fff !important;
        border-color: #bfc9d1 !important;
        background: #3a4256 !important;
        opacity: 1 !important;
      }
      .view-details-btn:hover, .view-details-btn:focus {
        border-color: #339af0 !important;
        background: rgba(51, 154, 240, 0.18) !important;
        color: #fff !important;
      }
      .bg-dark-green {
        background-color: #176a3a !important;
        color: #fff !important;
      }
      .quotes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 0.5rem;
      }
      .quote-card {
        background: #23293a; /* Dark background for the card */
        border: 1px solid #343a40; /* Light border */
        border-radius: 1rem;
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.8rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .quote-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
      }
      .quote-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.8rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #343a40; /* Light border */
      }
      .quote-id {
        font-size: 1.2rem;
        font-weight: 700;
        color: #232a37;
        letter-spacing: 0.5px;
      }
      .quote-status {
        font-size: 0.9rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 8px;
        background: #FFD600;
        color: #232a37;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .quote-card-body {
        font-size: 0.95rem;
        color: #232a37; /* Dark text for better readability */
        line-height: 1.6;
      }
      .quote-card-body div {
        margin-bottom: 0.4rem;
      }
      .quote-card-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #343a40; /* Light border */
      }
      .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .action-btn.approve {
        background: #22c55e;
        color: #fff;
      }
      .action-btn.approve:hover {
        background: #16a34a;
        box-shadow: 0 4px 12px #22c55e33;
      }
      .action-btn.reject {
        background: #ef4444;
        color: #fff;
      }
      .action-btn.reject:hover {
        background: #dc2626;
        box-shadow: 0 4px 12px #ef444433;
      }
      .action-btn.delete {
        background: #64748b;
        color: #fff;
      }
      .action-btn.delete:hover {
        background: #475569;
        box-shadow: 0 4px 12px #64748b33;
      }
      .action-btn:hover {
        background: #FFD600;
        color: #232a37;
        box-shadow: 0 4px 12px #FFD60033;
      }
      .action-btn:focus {
        outline: none;
      }
      .status-pending {
        background: #FFD600 !important;
        color: #232a37 !important;
      }
      .status-approved {
        background: #22c55e !important;
        color: #fff !important;
      }
      .status-rejected {
        background: #ef4444 !important;
        color: #fff !important;
      }
      .status-cancelled {
        background: #64748b !important;
        color: #fff !important;
      }
      `}</style>
    </div>
  );
};

export default Admin;