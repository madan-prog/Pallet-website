import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      console.log('Login response from server:', response.data);
      const { token, roles, username: responseUsername, fullName, email: responseEmail, phoneNumber } = response.data;
      
      const userData = { username: responseUsername, roles, fullName, email: responseEmail, phoneNumber };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false };
    }
  };

  const sendOtp = async (phoneNumber) => {
    try {
        await api.post('/auth/send-otp', { phoneNumber });
        return { success: true };
    } catch (error) {
        console.error("Send OTP failed:", error);
        return { success: false };
    }
  };

  const signup = async (fullName, email, username, password, phoneNumber, otp, role) => {
    try {
      await api.post('/auth/signup', { fullName, email, username, password, phoneNumber, otp, roles: [role] });
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage = error.response?.data?.message || error.response?.data || "Signup failed due to an unexpected error.";
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = { user, login, logout, signup, sendOtp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 

// User Info API
const checkUserInfoExists = async (email) => {
  try {
    const response = await api.get(`/user-info/${email}/exists`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking user info:', error);
    return false;
  }
};

const getUserInfo = async (email) => {
  try {
    const response = await api.get(`/user-info/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Admin Orders API
const getAdminOrders = async () => {
  return api.get('/admin/orders');
};
const getAdminOrderById = async (id) => {
  return api.get(`/admin/orders/${id}`);
};
const updateAdminOrderStatus = async (id, status) => {
  return api.put(`/admin/orders/${id}/status`, null, { params: { status } });
};

export { api, getAdminOrders, getAdminOrderById, updateAdminOrderStatus, checkUserInfoExists, getUserInfo }; 