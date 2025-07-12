import { useEffect, useState, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Download, X, FileText, Image, File, Package, Warehouse, CircleDollarSign, CalendarDays } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion } from 'framer-motion';
import './MyOrders.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import Preloader from './Preloader';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const stompClientRef = useRef(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
      connectWebSocket();
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
    // eslint-disable-next-line
  }, [user]);

  const fetchOrders = async () => {
    if (orders.length === 0) setLoading(true);
    try {
      const [ordersRes, quotesRes] = await Promise.all([
        api.get(`/orders/user/${user.email}`),
        api.get(`/quotes/user/${user.email}`)
      ]);
      const ordersData = ordersRes.data || [];
      const pendingQuotes = (quotesRes.data || []).filter(q => q.status === 'pending');
      const pendingQuoteObjects = pendingQuotes.map(q => ({
        ...q,
        status: q.status,
        quoteDetails: q.details,
        createdAt: q.createdAt,
        id: q.id,
        isPendingQuote: true
      }));
      setOrders([...pendingQuoteObjects, ...ordersData]);
    } catch (err) {
      toast.error('Failed to fetch orders');
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
          // Always refresh orders on quote update, as order status may change
          fetchOrders();
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const handleCancel = async (orderId) => {
    try {
      await api.patch(`/quotes/${orderId}/status?status=cancelled`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const handleEdit = (order) => {
    localStorage.setItem('editQuoteId', order.id);
    navigate('/quotation');
  };

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

  // Add handler for updating order status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`);
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="my-orders-page">
      <div className="container">
        <h1 className="display-4 fw-bold mb-2 text-warning text-center">My Orders</h1>
        <p className="fs-5 text-light mb-4 text-center" style={{ maxWidth: 700, margin: '0 auto 2rem auto' }}>
          Here you can view, download, and manage all your pallet orders.
        </p>
        <div className="orders-container">
          <div className="d-flex justify-content-end mb-4 gap-2">
            <select
              className="form-select w-auto bg-dark text-light border-secondary"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ minWidth: 200, background: '#232a37', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="price_desc">Total Price: High-Low</option>
              <option value="price_asc">Total Price: Low-High</option>
              <option value="status_az">Status: A-Z</option>
              <option value="status_za">Status: Z-A</option>
            </select>
          </div>
          {loading && orders.length === 0 ? (
            <Preloader size={48} fullscreen={false} />
          ) : orders.length === 0 ? (
            <div className="empty-orders-container">
              <img src="/images/pallet-bg.png" alt="No orders" style={{ width: 120, opacity: 0.5, marginBottom: 16 }} />
              <div className="fs-4 mt-3 mb-2 fw-bold text-light">No orders found.</div>
              <div className="text-secondary">You haven't placed any orders yet. Start building your custom pallet!</div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="row g-4">
                {orders
                  .slice()
                  .sort((a, b) => {
                    if (sortBy === 'date_desc') {
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    } else if (sortBy === 'date_asc') {
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    } else if (sortBy === 'price_desc') {
                      return (b.quoteDetails?.totalPrice || 0) - (a.quoteDetails?.totalPrice || 0);
                    } else if (sortBy === 'price_asc') {
                      return (a.quoteDetails?.totalPrice || 0) - (b.quoteDetails?.totalPrice || 0);
                    } else if (sortBy === 'status_az') {
                      return (a.status || '').localeCompare(b.status || '');
                    } else if (sortBy === 'status_za') {
                      return (b.status || '').localeCompare(a.status || '');
                    }
                    return 0;
                  })
                  .map((order, idx) => {
                    const details = order.quoteDetails || order.details || {};
                    return (
                      <motion.div
                        className="col-12 col-lg-6"
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                      >
                        <div className="order-card" style={{ cursor: 'pointer' }}>
                          <div className="order-card-header">
                            {order.status !== 'pending' ? (
                              <>
                                <span className="order-id">Order #{order.orderId || order.id}</span>
                              </>
                            ) : (
                              <span className="fw-bold text-warning fs-5">Quote #{details.quoteId || order.quoteId}</span>
                            )}
                            <span className={`badge fs-6 ${
                              order.status === 'approved' ? 'bg-success' :
                              order.status === 'pending' ? 'bg-warning text-dark' :
                              order.status === 'rejected' ? 'bg-danger' :
                              order.status === 'cancelled' ? 'bg-secondary' :
                              order.status === 'in production' ? 'bg-primary' :
                              order.status === 'shipped' ? 'bg-info text-dark' :
                              order.status === 'delivered' ? 'bg-success text-white' :
                              'bg-light text-dark'
                            }`}>{order.status}</span>
                          </div>
                          {/* Only show Quote ID below Order ID for non-pending orders */}
                          {order.status !== 'pending' && details.quoteId && (
                            <div className="order-detail-item mb-2" style={{ display: 'flex', alignItems: 'center', marginLeft: 2, marginTop: 4 }}>
                              <span className="text-warning" style={{ minWidth: 80 }}>Quote ID:</span>
                              <span className="fw-bold text-light" style={{ marginLeft: 4 }}>{details.quoteId}</span>
                            </div>
                          )}
                          <div className="order-card-body">
                            <div className="order-detail-item">
                              <Package size={20} />
                              <span>Type:</span>
                              <strong>{details.palletType || '-'}</strong>
                            </div>
                            <div className="order-detail-item">
                              <Warehouse size={20} />
                              <span>Quantity:</span>
                              <strong>{details.quantity || '-'}</strong>
                            </div>
                            <div className="order-detail-item">
                              <CircleDollarSign size={20} />
                              <span>Total Price:</span>
                              <strong className="text-success">₹{details.totalPrice?.toLocaleString() || '-'}</strong>
                            </div>
                            <div className="order-detail-item">
                              <CalendarDays size={20} />
                              <span>Date:</span>
                              <strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</strong>
                            </div>
                            <div className="order-detail-item">
                              <FileText size={20} />
                              <span>Files:</span>
                              {details.fileName ? (
                                <div className="d-flex align-items-center gap-2">
                                  {getFileIcon(details.fileName)}
                                  <button 
                                    className="btn btn-sm btn-link text-light p-0"
                                    onClick={() => handleFilePreview(order.id, details.fileName)}
                                    title={`${details.fileName} (${formatFileSize(details.fileSize || 0)})`}
                                  >
                                    {details.fileName.length > 20 
                                      ? details.fileName.substring(0, 20) + '...' 
                                      : details.fileName
                                    }
                                  </button>
                                </div>
                              ) : (
                                <strong>No files</strong>
                              )}
                            </div>
                          </div>
                          <div className="order-card-footer">
                            <button onClick={() => downloadOrder(order)} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                              <Download size={14} /> Download Info
                            </button>
                            {(order.status === 'pending' || order.status === 'approved') && (
                              <button
                                onClick={() => handleEdit(order)}
                                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                                title="Edit Quote"
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {(order.status === 'pending' || order.status === 'approved') && (
                              <button onClick={() => handleCancel(order.id)} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                                <X size={14} /> Cancel
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                              onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                              title="Show Details"
                            >
                              <FileText size={14} /> Show Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Order Details Modal */}
      {showModal && selectedOrder && (() => {
        const details = selectedOrder.quoteDetails || selectedOrder.details || {};
        return (
          <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
            <div className="modal-content" style={{ background: 'linear-gradient(135deg, #232a37 80%, #2d3748 100%)', borderRadius: 18, padding: 36, minWidth: 370, maxWidth: 480, color: '#fff', position: 'relative', boxShadow: '0 12px 40px 0 rgba(0,0,0,0.45)', border: '1.5px solid #4ade80' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 32,
                  width: 40,
                  height: 40,
                  lineHeight: '40px',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 10001,
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#ff4d4f')}
                onMouseOut={e => (e.currentTarget.style.color = '#fff')}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="fw-bold mb-2 text-center" style={{ color: '#4ade80', fontSize: 28, letterSpacing: 1 }}>{selectedOrder.orderId ? `Order #${selectedOrder.orderId}` : `Quote #${selectedOrder.quoteId || (selectedOrder.quoteDetails && selectedOrder.quoteDetails.quoteId)}`}</h3>
              {selectedOrder.status && <div className="mb-3 text-center"><span className={`badge fs-6 px-3 py-2 shadow ${
                selectedOrder.status === 'approved' ? 'bg-success' :
                selectedOrder.status === 'pending' ? 'bg-warning text-dark' :
                selectedOrder.status === 'rejected' ? 'bg-danger' :
                selectedOrder.status === 'cancelled' ? 'bg-secondary' :
                selectedOrder.status === 'in production' ? 'bg-primary' :
                selectedOrder.status === 'shipped' ? 'bg-info text-dark' :
                selectedOrder.status === 'delivered' ? 'bg-success text-white' :
                'bg-light text-dark'
              }`}>{selectedOrder.status.toUpperCase()}</span></div>}
              <div style={{ borderBottom: '1px solid #444', margin: '18px 0 16px 0' }} />
              <div className="mb-2 d-flex align-items-center" style={{ fontSize: 17 }}>
                <span className="text-warning fw-bold me-2" style={{ minWidth: 90 }}>Quote ID:</span>
                <span className="fw-bold text-light">{selectedOrder.quoteId || (selectedOrder.quoteDetails && selectedOrder.quoteDetails.quoteId)}</span>
              </div>
              <div className="mb-2 d-flex align-items-center"><Package size={18} className="me-2 text-warning" /><span className="fw-bold text-warning">Type:</span> <span className="ms-2 text-light">{details.palletType || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Length:</span> <span className="text-light">{details.length || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Width:</span> <span className="text-light">{details.width || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Height:</span> <span className="text-light">{details.height || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Additional Requirements:</span> <span className="text-light">{details.additionalRequirements || details.additionalInfo || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><Warehouse size={18} className="me-2 text-warning" /><span className="fw-bold text-warning">Quantity:</span> <span className="ms-2 text-light">{details.quantity || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><CircleDollarSign size={18} className="me-2 text-warning" /><span className="fw-bold text-warning">Total Price:</span> <span className="ms-2 fw-bold" style={{ color: '#4ade80' }}>₹{details.totalPrice?.toLocaleString() || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><CalendarDays size={18} className="me-2 text-warning" /><span className="fw-bold text-warning">Date:</span> <span className="ms-2 text-light">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Material:</span> <span className="text-light">{details.material || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Load Capacity:</span> <span className="text-light">{details.loadCapacity || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Urgency:</span> <span className="text-light">{details.urgency || '-'}</span></div>
              <div style={{ borderBottom: '1px solid #444', margin: '18px 0 16px 0' }} />
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Customer Name:</span> <span className="text-light">{details.customerName || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Email:</span> <span className="text-light">{details.email || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Phone:</span> <span className="text-light">{details.phone || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Company:</span> <span className="text-light">{details.company || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Address:</span> <span className="text-light">{details.address || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">State:</span> <span className="text-light">{details.state || '-'}</span></div>
              <div className="mb-2 d-flex align-items-center"><span className="fw-bold text-warning me-2">Pincode:</span> <span className="text-light">{details.pincode || '-'}</span></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

function downloadOrder(order) {
  const details = order.quoteDetails || order.details || {};
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.setTextColor('#4ade80');
  doc.text(order.orderId ? `Order #${order.orderId}` : `Quote #${order.quoteId || details.quoteId || ''}`, 14, 18);
  doc.setFontSize(12);
  doc.setTextColor('#222');
  let y = 30;
  const addRow = (label, value) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(value || '-'), 60, y);
    y += 9;
  };
  addRow('Quote ID:', order.quoteId || details.quoteId || '-');
  addRow('Type:', details.palletType);
  addRow('Length:', details.length);
  addRow('Width:', details.width);
  addRow('Height:', details.height);
  addRow('Additional Requirements:', details.additionalRequirements || details.additionalInfo);
  addRow('Quantity:', details.quantity);
  addRow('Total Price:', details.totalPrice ? `₹${details.totalPrice.toLocaleString()}` : '-');
  addRow('Date:', order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-');
  addRow('Material:', details.material);
  addRow('Load Capacity:', details.loadCapacity);
  addRow('Urgency:', details.urgency);
  y += 4;
  addRow('Customer Name:', details.customerName);
  addRow('Email:', details.email);
  addRow('Phone:', details.phone);
  addRow('Company:', details.company);
  addRow('Address:', details.address);
  addRow('State:', details.state);
  addRow('Pincode:', details.pincode);
  doc.save(`${order.orderId ? 'order' : 'quote'}-${order.orderId || order.quoteId || details.quoteId || 'info'}.pdf`);
}

export default MyOrders; 