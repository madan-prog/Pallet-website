import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, TrendingUp, DollarSign, 
  FileText, Settings, Bell, Download,
  Calendar, Clock, CheckCircle, AlertTriangle,
  Image, File, Trash2, X, Truck, Loader2, Eye, XCircle, Search, Play, Hammer, Mail, Edit, UserX, Plus, Star, Tag, Download as DownloadIcon, User, Phone, BarChart3, PieChart, Activity, Pencil
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { api, getAdminOrders, updateAdminOrderStatus, getAdminOrderById } from '../context/AuthContext';
import Modal from 'react-modal';
import SettingsForm from './SettingsForm';
import './AdminPanel.css';
import { jsPDF } from 'jspdf';
import Preloader from './Preloader';
import { useAuth } from '../context/AuthContext';

// Custom hook for number counting animation
const useCountAnimation = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (endValue > 0 && !hasAnimated && !isAnimating) {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        setCount(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
          setIsAnimating(false);
          setHasAnimated(true);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (hasAnimated) {
      // If already animated, just set the final value
      setCount(endValue);
    } else {
      setCount(endValue);
    }
  }, [endValue, duration, isAnimating, hasAnimated]);

  return count;
};

// Animated Number Component
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const animatedValue = useCountAnimation(value, duration);
  return <span>{animatedValue}</span>;
};

// Animated Currency Component
const AnimatedCurrency = ({ value, duration = 1000 }) => {
  const animatedValue = useCountAnimation(value, duration);
  return <span>{formatINRCurrency(animatedValue)}</span>;
};

// Add at the top, after imports
function formatINRCurrency(value) {
  if (value == null) return '₹0';
  if (value >= 10000000) return `₹${(value/10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value/100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value/1000).toFixed(0)}K`;
  return `₹${value}`;
}

// Chart Data
const chartData = {
  monthlyRevenue: [
    { month: 'Jan', revenue: 285000, orders: 45 },
    { month: 'Feb', revenue: 320000, orders: 52 },
    { month: 'Mar', revenue: 298000, orders: 48 },
    { month: 'Apr', revenue: 345000, orders: 58 },
    { month: 'May', revenue: 378000, orders: 62 },
    { month: 'Jun', revenue: 412000, orders: 68 },
    { month: 'Jul', revenue: 395000, orders: 65 },
    { month: 'Aug', revenue: 428000, orders: 72 },
    { month: 'Sep', revenue: 456000, orders: 78 },
    { month: 'Oct', revenue: 489000, orders: 82 },
    { month: 'Nov', revenue: 523000, orders: 88 },
    { month: 'Dec', revenue: 567000, orders: 95 }
  ],
  orderStatus: [
    { name: 'Completed', value: 1156, color: '#10B981' },
    { name: 'Processing', value: 67, color: '#F59E0B' },
    { name: 'Pending', value: 23, color: '#EF4444' },
    { name: 'Cancelled', value: 1, color: '#6B7280' }
  ],
  palletTypes: [
    { name: 'Euro Pallet', value: 45, color: '#3B82F6' },
    { name: 'Standard Pallet', value: 30, color: '#10B981' },
    { name: 'Heavy Duty', value: 15, color: '#F59E0B' },
    { name: 'Custom Pallet', value: 10, color: '#8B5CF6' }
  ],
  weeklyOrders: [
    { day: 'Mon', orders: 12, revenue: 89000 },
    { day: 'Tue', orders: 18, revenue: 134000 },
    { day: 'Wed', orders: 15, revenue: 112000 },
    { day: 'Thu', orders: 22, revenue: 165000 },
    { day: 'Fri', orders: 19, revenue: 142000 },
    { day: 'Sat', orders: 8, revenue: 61000 },
    { day: 'Sun', orders: 5, revenue: 38000 }
  ]
};

// Chart Components
const RevenueChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={chartData.monthlyRevenue}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#1F2937', 
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#F9FAFB'
        }}
      />
      <Legend />
      <Area 
        type="monotone" 
        dataKey="revenue" 
        stroke="#10B981" 
        fill="#10B981" 
        fillOpacity={0.3}
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);

const OrderStatusChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsPieChart>
      <Pie
        data={chartData.orderStatus}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
      >
        {chartData.orderStatus.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#1F2937', 
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#F9FAFB'
        }}
      />
      <Legend />
    </RechartsPieChart>
  </ResponsiveContainer>
);

const PalletTypesChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData.palletTypes}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="name" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#1F2937', 
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#F9FAFB'
        }}
      />
      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const WeeklyOrdersChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData.weeklyOrders}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="day" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#1F2937', 
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#F9FAFB'
        }}
      />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="orders" 
        stroke="#F59E0B" 
        strokeWidth={3}
        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
        activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2, fill: '#F59E0B' }}
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#10B981" 
        strokeWidth={3}
        dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
        activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const Admin = () => {
  const { user } = useAuth();
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

  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const ordersPerPage = 8;
  const filteredOrders = orders
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
    });
  const orderTotalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice((orderCurrentPage - 1) * ordersPerPage, orderCurrentPage * ordersPerPage);

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerModal, setCustomerModal] = useState({ open: false, customer: null });
  const [editCustomerModal, setEditCustomerModal] = useState({ open: false, customer: null });
  const [emailModal, setEmailModal] = useState({ open: false, customer: null });
const [customers, setCustomers] = useState([]);
const [customerLoading, setCustomerLoading] = useState(true);
const [customerError, setCustomerError] = useState(null);

useEffect(() => {
  async function fetchAllCustomerData() {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const [userRes, orderRes, quoteRes] = await Promise.all([
        api.get('/user-info/all'),
        api.get('/orders/all'),
        api.get('/quotes/all'),
      ]);
      setCustomers(userRes.data || []);
      setOrders(orderRes.data || []);
      setQuotes(quoteRes.data || []);
    } catch (err) {
      setCustomerError('Failed to fetch customer data');
    }
    setCustomerLoading(false);
  }
  if (activeTab === 'customers') fetchAllCustomerData();
}, [activeTab]);

// Aggregate order/quote stats per customer
const customerStats = customers.map(c => {
  const userOrders = orders.filter(o => o.userId === c.userId);
  const userQuotes = quotes.filter(q => q.userId === c.userId);
  const value = userOrders.reduce((sum, o) => sum + (o.quoteDetails?.totalPrice || 0), 0);
  // Calculate total pallets ordered
  const totalPallets = userOrders.reduce((sum, o) => sum + (parseInt(o.details?.quantity) || 0), 0);
  return {
    id: c.userId,
    name: c.fullName,
    company: c.company,
    email: c.email,
    phone: c.phone,
    orders: userOrders.length,
    quotes: userQuotes.length,
    value: value,
    last: userOrders.length > 0 ? userOrders[0].createdAt : (userQuotes[0]?.createdAt || null),
    totalPallets,
    discountCategory: c.discountCategory || '-', // Add discountCategory from backend
  };
});

// Filter out administrators from customerStats
const filteredCustomers = customerStats.filter(c => {
  const search = customerSearch.toLowerCase();
  const matchesSearch =
    (c.name || '').toLowerCase().includes(search) ||
    (c.email || '').toLowerCase().includes(search) ||
    (c.phone || '').includes(search) ||
    (c.company || '').toLowerCase().includes(search);
  return matchesSearch;
});
const totalValue = customerStats.reduce((sum, c) => sum + c.value, 0);

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
    { id: 'charts', label: 'Analytics', icon: <BarChart3 size={16} /> },
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
    // Extract folder from quoteId (assuming quoteId is the folder name)
    const downloadUrl = `http://localhost:8080/api/download/${quoteId}/${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
  };

  const handleFilePreview = (quoteId, fileName) => {
    if (isImageFile(fileName)) {
      const imageUrl = `http://localhost:8080/api/download/${quoteId}/${encodeURIComponent(fileName)}`;
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

  // Add handler to delete customer
  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try {
      await api.delete(`/user-info/${customer.id}`);
      toast.success('Customer deleted successfully');
      setCustomers(prev => prev.filter(c => c.userId !== customer.id));
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };
  // Add handler to save edited customer
  const handleSaveEditCustomer = async (editedCustomer) => {
    try {
      await api.put(`/user-info/${editedCustomer.id}`, editedCustomer);
      toast.success('Customer updated successfully');
      setCustomers(prev => prev.map(c => c.userId === editedCustomer.id ? { ...c, ...editedCustomer } : c));
      setEditCustomerModal({ open: false, customer: null });
    } catch (err) {
      toast.error('Failed to update customer');
    }
  };
  // Add handler to send email
  const handleSendEmail = async (customer, subject, message, setModalState) => {
    setModalState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      await api.post('/email/send', { to: customer.email, subject, message });
      setModalState(prev => ({ ...prev, loading: false, error: null, success: 'Email sent successfully!' }));
      setTimeout(() => setEmailModal({ open: false, customer: null }), 1200);
      toast.success('Email sent successfully');
    } catch (err) {
      let errorMsg = 'Failed to send email';
      if (err?.response?.status === 403) errorMsg = 'You are not authorized to send emails.';
      else if (err?.response?.data) errorMsg = err.response.data;
      setModalState(prev => ({ ...prev, loading: false, error: errorMsg, success: null }));
      toast.error(errorMsg);
    }
  };

  const [editDiscountModal, setEditDiscountModal] = useState({ open: false, customer: null, value: '' });
  const DISCOUNT_CATEGORIES = [
    '', 'VIP', 'Bulk Orders', 'Frequent Buyer', 'Special Pricing'
  ];
  const ALLOWED_DISCOUNT_CATEGORIES = ['', 'VIP', 'Bulk Orders', 'Frequent Buyer', 'Special Pricing'];

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
                    <th className="text-center" style={{ verticalAlign: 'middle' }}>Attachments</th> {/* Centered heading */}
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
                      {/* Attachments column */}
                      <td className="text-center align-middle">
                        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">
                          {Array.isArray(quote.files) && quote.files.length > 0 ? (
                            quote.files.map((fileName, i) => (
                              <button
                                key={fileName}
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                style={{ borderRadius: 7, fontSize: '0.95rem', padding: '3px 8px' }}
                                title={`Download ${fileName}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleFilePreview(quote.id, fileName);
                                }}
                              >
                                {getFileIcon(fileName)}
                                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
                              </button>
                            ))
                          ) : (
                            <span className="text-secondary">No files</span>
                          )}
                        </div>
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
                    {paginatedOrders.map((order, idx) => (
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
            {orderTotalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
                <button className="btn btn-outline-warning btn-sm" disabled={orderCurrentPage === 1} onClick={() => setOrderCurrentPage(orderCurrentPage - 1)}>&laquo; Prev</button>
                <span style={{ color: '#ffc107', fontWeight: 500, margin: '0 12px' }}>Page {orderCurrentPage} of {orderTotalPages}</span>
                <button className="btn btn-outline-warning btn-sm" disabled={orderCurrentPage === orderTotalPages} onClick={() => setOrderCurrentPage(orderCurrentPage + 1)}>Next &raquo;</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Charts Tab Content */}
        {activeTab === 'charts' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="charts-section"
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="fw-bold mb-2 d-flex align-items-center gap-3" style={{fontSize:'2.1rem'}}>
                  <BarChart3 size={32} className="text-warning" /> Analytics Dashboard
                </h2>
                <p className="fs-5 text-secondary mb-0">Visualize your business performance and trends</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="row g-4">
              {/* Revenue Chart */}
              <motion.div 
                className="col-lg-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="card bg-dark border-secondary rounded-4 p-4 h-100" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <TrendingUp size={20} className="text-success" />
                      Monthly Revenue Trend
                    </h5>
                    <span className="badge bg-success-subtle text-success px-3 py-2">₹{formatINRCurrency(567000)}</span>
                  </div>
                  <RevenueChart />
                </div>
              </motion.div>

              {/* Order Status Chart */}
              <motion.div 
                className="col-lg-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="card bg-dark border-secondary rounded-4 p-4 h-100" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <PieChart size={20} className="text-warning" />
                      Order Status Distribution
                    </h5>
                  </div>
                  <OrderStatusChart />
                </div>
              </motion.div>

              {/* Weekly Orders Chart */}
              <motion.div 
                className="col-lg-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="card bg-dark border-secondary rounded-4 p-4 h-100" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <Activity size={20} className="text-info" />
                      Weekly Orders & Revenue
                    </h5>
                  </div>
                  <WeeklyOrdersChart />
                </div>
              </motion.div>

              {/* Pallet Types Chart */}
              <motion.div 
                className="col-lg-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="card bg-dark border-secondary rounded-4 p-4 h-100" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <Package size={20} className="text-primary" />
                      Pallet Types Distribution
                    </h5>
                  </div>
                  <PalletTypesChart />
                </div>
              </motion.div>
            </div>

            {/* Key Metrics Cards */}
            <motion.div 
              className="row g-4 mt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="col-md-3">
                <div className="card bg-dark border-secondary rounded-4 p-4 text-center" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <DollarSign size={24} className="text-success me-2" />
                    <h6 className="fw-bold mb-0">Total Revenue</h6>
                  </div>
                  <h4 className="fw-bold text-success mb-0">{formatINRCurrency(2850000)}</h4>
                  <small className="text-secondary">This year</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-dark border-secondary rounded-4 p-4 text-center" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Package size={24} className="text-primary me-2" />
                    <h6 className="fw-bold mb-0">Total Orders</h6>
                  </div>
                  <h4 className="fw-bold text-primary mb-0">1,247</h4>
                  <small className="text-secondary">This year</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-dark border-secondary rounded-4 p-4 text-center" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Users size={24} className="text-warning me-2" />
                    <h6 className="fw-bold mb-0">Active Customers</h6>
                  </div>
                  <h4 className="fw-bold text-warning mb-0">342</h4>
                  <small className="text-secondary">This month</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-dark border-secondary rounded-4 p-4 text-center" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <TrendingUp size={24} className="text-info me-2" />
                    <h6 className="fw-bold mb-0">Growth Rate</h6>
                  </div>
                  <h4 className="fw-bold text-info mb-0">+23.5%</h4>
                  <small className="text-secondary">vs last year</small>
                </div>
              </div>
            </motion.div>
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
            <div className="settings-section p-4 rounded-4" style={{
              background: 'linear-gradient(135deg, #1a202c 0%, #23293a 100%)',
              border: '1px solid #343a40',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              minHeight: '80vh',
              width: '100%',
              maxWidth: '1200px'
            }}>
              <SettingsForm />
            </div>
          </motion.div>
        )}
        {activeTab === 'customers' && (
          <div className="customer-section p-4 rounded-4" style={{
            background: 'linear-gradient(135deg, #1a202c 0%, #23293a 100%)',
            border: '1px solid #343a40',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            minHeight: '80vh'
          }}>
                        <div className="d-flex align-items-start justify-content-between mb-4">
              <div className="d-flex flex-column">
                <h2 className="fw-bold mb-0 d-flex align-items-center gap-3" style={{fontSize:'2.1rem'}}>
                  <User size={32} className="text-warning" /> Customer Management
                </h2>
                <div className="mt-3 fs-5 text-secondary">Manage customer relationships and track interactions</div>
              </div>
              <div className="d-flex gap-3">
                <input className="form-control fs-5 px-3 py-2" style={{maxWidth:340, borderRadius:12}} placeholder="Search customers by name, email, phone..." value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} />
              </div>
            </div>
            
            {/* Customer Summary Card */}
            <motion.div 
              className="customer-summary-card mb-4 p-5 rounded-4 position-relative overflow-hidden" 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                border: '1px solid #475569',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                position: 'relative'
              }}
            >
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }}></div>
              
              <div className="row g-4 position-relative">
                <motion.div 
                  className="col-md-3 col-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="fs-1 fw-bold text-warning mb-2" style={{textShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'}}>
                      <AnimatedNumber value={customerStats.length} />
                    </div>
                    <div className="text-light fs-6 fw-semibold">Total Customers</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="col-md-3 col-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="fs-1 fw-bold text-success mb-2" style={{textShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'}}>
                      <AnimatedNumber value={customerStats.filter(c => c.orders > 0).length} />
                    </div>
                    <div className="text-light fs-6 fw-semibold">Active Customers</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="col-md-3 col-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="fs-1 fw-bold text-info mb-2" style={{textShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'}}>
                      <AnimatedNumber value={customerStats.reduce((sum, c) => sum + c.orders, 0)} />
                    </div>
                    <div className="text-light fs-6 fw-semibold">Total Orders</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="col-md-3 col-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="fs-1 fw-bold text-success mb-2" style={{textShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'}}>
                      <AnimatedCurrency value={totalValue} />
                    </div>
                    <div className="text-light fs-6 fw-semibold">Total Value</div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="row mt-4 position-relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{
                    background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(71, 85, 105, 0.1) 100%)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <div className="text-light fs-6 fw-medium">
                      <span className="text-warning me-2" style={{fontSize: '0.8rem'}}>●</span> 
                      <span className="fw-semibold">Top Customer:</span> 
                      <span className="ms-1 text-warning fw-bold">{customerStats.length > 0 ? customerStats.reduce((max, c) => c.value > max.value ? c : max).name : 'N/A'}</span>
                    </div>
                    <div className="text-light fs-6 fw-medium">
                      <span className="text-info me-2" style={{fontSize: '0.8rem'}}>●</span> 
                      <span className="fw-semibold">Avg. Order Value:</span> 
                      <span className="ms-1 text-info fw-bold">{customerStats.length > 0 ? formatINRCurrency(totalValue / customerStats.filter(c => c.orders > 0).length) : '₹0'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="customer-grid mb-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              {filteredCustomers.map((c, index) => (
                <motion.div 
                  key={c.id} 
                  className="customer-card d-flex flex-column" 
                  style={{textAlign:'left'}}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1.6 + (index * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <div className="customer-card-header d-flex align-items-center gap-2 mb-1">
                    <span className="fw-bold customer-name">{c.name}</span>
                    {c.discountCategory && c.discountCategory !== '-' && (
                      <span className="customer-badge ms-2" style={{background:'#ffe082',color:'#23293a',fontWeight:600,fontSize:'0.93rem',padding:'4px 10px',borderRadius:'8px'}}>
                        {c.discountCategory} Discount
                      </span>
                    )}
                    {/* Admin override button */}
                    {user && user.roles && user.roles.includes('ROLE_ADMIN') && (
                      <button className="btn btn-sm btn-outline-secondary ms-2" title="Edit Discount Category" onClick={() => setEditDiscountModal({ open: true, customer: c, value: c.discountCategory || '' })}>
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>
                  <div className="customer-company text-secondary mb-1"><span className="fw-semibold">Company Name:</span> {c.company}</div>
                  <div className="customer-contact mb-2">
                    <div className="customer-phone text-secondary" style={{marginBottom: '6px'}}><Phone size={14} className="me-1" /> {c.phone}</div>
                    <div className="customer-email" style={{color:'#bfc9d1', fontWeight:400, wordBreak:'break-all'}}><Mail size={14} className="me-1" /> {c.email}</div>
                  </div>
                  <div className="customer-activity mb-2 d-flex flex-row gap-4 align-items-center">
                    <div><Package size={14} className="me-1 text-primary" /> <b>{c.orders}</b> orders</div>
                    <div><FileText size={14} className="me-1 text-info" /> <b>{c.quotes}</b> quotes</div>
                    <div className="text-secondary small">Last: {c.last ? new Date(c.last).toLocaleDateString() : '-'}</div>
                  </div>
                  <div className="d-flex flex-row align-items-center gap-3 mb-2">
                    <div className="customer-value fw-bold fs-5 d-flex align-items-center">{formatINRCurrency(c.value)}</div>
                  </div>
                  <div className="customer-actions d-flex gap-2 mt-auto justify-content-end">
                    <button className="btn btn-sm btn-outline-info px-2 py-1" title="View" onClick={()=>setCustomerModal({open:true,customer:c})}><Eye size={18}/></button>
                    <button type="button" className="btn btn-sm btn-outline-warning px-2 py-1" title="Email" onClick={()=>setEmailModal({open:true,customer:c})}><Mail size={18}/></button>
                    <button className="btn btn-sm btn-outline-danger px-2 py-1" title="Delete" onClick={() => handleDeleteCustomer(c)}><Trash2 size={18}/></button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {/* Customer Details Modal (view) */}
            {customerModal.open && (
              <Modal isOpen={customerModal.open} onRequestClose={()=>setCustomerModal({open:false,customer:null})} ariaHideApp={false} className="modal-dialog" overlayClassName="modal-backdrop" style={{
                content: {
                  background: '#23293a',
                  color: '#fff',
                  borderRadius: '1rem',
                  maxWidth: '540px',
                  minWidth: '400px',
                  margin: 'auto',
                  padding: '1.2rem 2.5rem',
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  bottom: 'auto',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 4px 32px #0005',
                  position: 'absolute',
                },
                overlay: {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  zIndex: 1000
                }
              }}>
                <div className="modal-content bg-dark text-light p-3 rounded-4" style={{maxWidth:520}}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0 fs-3">Customer Details</h4>
                    <button className="btn btn-sm btn-outline-secondary" onClick={()=>setCustomerModal({open:false,customer:null})}><X size={20}/></button>
                  </div>
                  <div className="mb-2"><span className="fw-semibold">Name:</span> {customerModal.customer.name}</div>
                  <div className="mb-2"><span className="fw-semibold">Email:</span> {customerModal.customer.email}</div>
                  <div className="mb-2"><span className="fw-semibold">Phone:</span> {customerModal.customer.phone}</div>
                  <div className="mb-2"><span className="fw-semibold">Company:</span> {customerModal.customer.company || '-'}</div>
                  <div className="mb-2"><span className="fw-semibold">Orders:</span> {customerModal.customer.orders}</div>
                  <div className="mb-2"><span className="fw-semibold">Quotes:</span> {customerModal.customer.quotes}</div>
                  <div className="mb-2"><span className="fw-semibold">Total Value:</span> {formatINRCurrency(customerModal.customer.value)}</div>
                  <div className="mb-2"><span className="fw-semibold">Last Activity:</span> {new Date(customerModal.customer.last).toLocaleDateString()}</div>
                  <div className="mb-2"><span className="fw-semibold">Discount Category:</span> {customerModal.customer.discountCategory || '-'}</div>
                </div>
              </Modal>
            )}
            {/* Edit, Email, and other modals can be added similarly */}
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
                {selectedOrder.quoteDetails?.quoteId && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Quote ID:</span>
                    <span>{selectedOrder.quoteDetails.quoteId}</span>
                  </div>
                )}
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
        {/* Add Edit Customer Modal */}
        {editCustomerModal.open && (
          <Modal isOpen={editCustomerModal.open} onRequestClose={()=>setEditCustomerModal({open:false,customer:null})} ariaHideApp={false} className="modal-dialog" overlayClassName="modal-backdrop" style={{
            content: {
              background: '#23293a',
              color: '#fff',
              borderRadius: '1rem',
              maxWidth: '540px',
              minWidth: '400px',
              margin: 'auto',
              padding: '1.2rem 2.5rem',
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 4px 32px #0005',
              position: 'absolute',
            },
            overlay: {
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 1000
            }
          }}>
            <div className="modal-content bg-dark text-light p-3 rounded-4" style={{maxWidth:520}}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0 fs-3">Edit Customer</h4>
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>setEditCustomerModal({open:false,customer:null})}><X size={20}/></button>
              </div>
              {/* Simple form for editing customer fields */}
              <form onSubmit={e => { e.preventDefault(); handleSaveEditCustomer(editCustomerModal.customer); }}>
                <div className="mb-2"><label className="fw-semibold">Name:</label><input className="form-control" value={editCustomerModal.customer.name} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, name: e.target.value}}))} /></div>
                <div className="mb-2"><label className="fw-semibold">Email:</label><input className="form-control" value={editCustomerModal.customer.email} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, email: e.target.value}}))} /></div>
                <div className="mb-2"><label className="fw-semibold">Phone:</label><input className="form-control" value={editCustomerModal.customer.phone} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, phone: e.target.value}}))} /></div>
                <div className="mb-2"><label className="fw-semibold">Company:</label><input className="form-control" value={editCustomerModal.customer.company} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, company: e.target.value}}))} /></div>
                <div className="mb-2"><label className="fw-semibold">Status:</label><select className="form-select" value={editCustomerModal.customer.status} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, status: e.target.value}}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                <div className="mb-3"><label className="fw-semibold">Tags (comma separated):</label><input className="form-control" value={editCustomerModal.customer.tags?.join(', ') || ''} onChange={e => setEditCustomerModal(m => ({...m, customer: {...m.customer, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)}}))} /></div>
                <button type="submit" className="btn btn-success px-4">Save</button>
              </form>
            </div>
          </Modal>
        )}
        {/* Add Email Modal */}
        {emailModal.open && (
          <Modal
            isOpen={emailModal.open}
            onRequestClose={()=>setEmailModal({open:false,customer:null})}
            ariaHideApp={false}
            className="modal-dialog"
            overlayClassName="modal-backdrop"
            style={{
              content: {
                background: '#23293a',
                color: '#fff',
                borderRadius: '1rem',
                maxWidth: '520px',
                minWidth: '320px',
                margin: 'auto',
                padding: '1.2rem 2.5rem',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 4px 32px #0005',
                position: 'absolute',
              },
              overlay: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 1000
              }
            }}
          >
            <EnhancedEmailModal customer={emailModal.customer} onClose={()=>setEmailModal({open:false,customer:null})} onSend={handleSendEmail} />
          </Modal>
        )}
        {editDiscountModal.open && (
          <Modal isOpen={true} onRequestClose={() => setEditDiscountModal({ open: false, customer: null, value: '' })} ariaHideApp={false} style={{ overlay: { zIndex: 9999, background: 'rgba(0,0,0,0.45)' }, content: { maxWidth: 420, margin: 'auto', borderRadius: 16, background: '#23293a', color: '#fff', border: '1.5px solid #ffd600', padding: 32 } }}>
            <h4 className="fw-bold mb-3">Edit Discount Category</h4>
            <div className="mb-3">
              <label className="form-label">Select Discount Category</label>
              <select className="form-select" value={editDiscountModal.value} onChange={e => setEditDiscountModal(m => ({ ...m, value: e.target.value }))}>
                {DISCOUNT_CATEGORIES.map(opt => <option key={opt} value={opt}>{opt || 'None'}</option>)}
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary px-3" onClick={() => setEditDiscountModal({ open: false, customer: null, value: '' })}>Cancel</button>
              <button className="btn btn-warning px-4" onClick={async () => {
                if (!editDiscountModal.customer) return;
                if (editDiscountModal.value === undefined || !ALLOWED_DISCOUNT_CATEGORIES.includes(editDiscountModal.value)) {
                  toast.error('Please select a valid discount category.');
                  return;
                }
                try {
                  await api.put(`/user-info/${editDiscountModal.customer.id}/discount-category`, { discountCategory: editDiscountModal.value });
                  toast.success('Discount category updated!');
                  setEditDiscountModal({ open: false, customer: null, value: '' });
                  // Refresh customer data
                  if (activeTab === 'customers') fetchAllCustomerData();
                } catch (err) {
                  toast.error('Failed to update discount category');
                }
              }}>Save</button>
            </div>
          </Modal>
        )}
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
      .customer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 0.5rem;
      }
      .customer-card {
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
      .customer-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
      }
      .customer-card-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .customer-name {
        font-size: 1.1rem;
        color: #ffc107;
        font-weight: 600;
      }
      .customer-company {
        font-size: 0.9rem;
      }
      .customer-badge {
        background: #343a40;
        color: #ffc107;
        font-size: 0.8rem;
        padding: 4px 10px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      .customer-contact {
        font-size: 0.9rem;
        color: #bfc9d1;
      }
      .customer-email, .customer-phone {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .customer-activity {
        font-size: 0.9rem;
        color: #bfc9d1;
      }
      .customer-value {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #22c55e;
        font-weight: 600;
      }
      .customer-status {
        text-align: center;
      }
      .customer-actions {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      `}</style>
    </div>
  );
};

export default Admin;

function EnhancedEmailModal({ customer, onClose, onSend }) {
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [modalState, setModalState] = React.useState({ loading: false, error: null, success: null });

  const handleSubmit = e => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setModalState(prev => ({ ...prev, error: 'Subject and message are required.' }));
      return;
    }
    onSend(customer, subject, message, setModalState);
  };

  return (
    <div className="modal-content bg-dark text-light p-4 rounded-4" style={{ maxWidth: 520, minWidth: 400 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 fs-3">Send Email</h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}><X size={20}/></button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="fw-semibold mb-2 d-block">To:</label>
          <input 
            className="form-control bg-dark border-secondary" 
            value={customer.email} 
            disabled 
            style={{ color: '#bfc9d1' }}
          />
        </div>
        
        <div className="mb-3">
          <label className="fw-semibold mb-2 d-block">Subject:</label>
          <input 
            className="form-control bg-dark border-secondary" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            required 
            disabled={modalState.loading} 
            placeholder="Email subject"
            style={{ color: '#e0e6ed' }}
          />
        </div>
        
        <div className="mb-3">
          <label className="fw-semibold mb-2 d-block">Message:</label>
          <textarea 
            className="form-control bg-dark border-secondary" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            rows={5} 
            required 
            disabled={modalState.loading} 
            placeholder="Type your message here"
            style={{ color: '#e0e6ed', resize: 'vertical' }}
          />
        </div>
        
        {modalState.error && (
          <div className="alert alert-danger py-2 px-3 mb-3">
            {modalState.error}
          </div>
        )}
        
        {modalState.success && (
          <div className="alert alert-success py-2 px-3 mb-3">
            {modalState.success}
          </div>
        )}
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary px-3" 
            onClick={onClose}
            disabled={modalState.loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-warning px-4" 
            disabled={modalState.loading}
          >
            {modalState.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Add this helper to update tags in backend
const updateCustomerTags = async (email, tags) => {
  // Remove all tags first (optional, or you can sync)
  // For each tag, add it
  try {
    // First, remove all known tags (VIP, Bulk Orders, etc.)
    const allPossibleTags = ['VIP', 'Bulk Orders', 'Frequent Buyer', 'Special Pricing'];
    for (const tag of allPossibleTags) {
      if (!tags.includes(tag)) {
        await api.delete(`/admin/orders/user/${email}/tags`, { data: JSON.stringify(tag), headers: { 'Content-Type': 'application/json' } });
      }
    }
    // Then, add all tags that should be present
    for (const tag of tags) {
      await api.post(`/admin/orders/user/${email}/tags`, JSON.stringify(tag), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    toast.error('Failed to update tags');
  }
};

// Helper to fetch tags for a customer
const fetchCustomerTags = async (email) => {
  try {
    const res = await api.get(`/admin/orders/user/${email}/tags`);
    return res.data || [];
  } catch {
    return [];
  }
};
// Helper to add a tag
const addCustomerTag = async (email, tag) => {
  await api.post(`/admin/orders/user/${email}/tags`, JSON.stringify(tag), { headers: { 'Content-Type': 'application/json' } });
};
// Helper to remove a tag
const removeCustomerTag = async (email, tag) => {
  await api.delete(`/admin/orders/user/${email}/tags`, { data: JSON.stringify(tag), headers: { 'Content-Type': 'application/json' } });
};