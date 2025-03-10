import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const apiClient = {
  async getFirebaseToken() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(true); // Force token refresh
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Automatically get fresh token
    const token = await this.getFirebaseToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    if (options.data && !(options.data instanceof FormData)) {
      config.body = JSON.stringify(options.data);
    } else if (options.data) {
      config.body = options.data;
      delete headers['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}/api${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  },

  // Products API
  async getProducts() {
    return this.request('/products');
  },

  async addProduct(formData) {
    return this.request('/products', {
      method: 'POST',
      data: formData
    });
  },

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE'
    });
  },

  // Orders API
  async getOrders() {
    return this.request('/orders');
  },

  async getOrderLineItems(orderId) {
    return this.request(`/orders/session/${orderId}/line-items`);
  },

  async getTimeSlotAvailability() {
    return this.request('/orders/timeslots/availability');
  },

  async createCheckoutSession(items, timeSlot) {
    return this.request('/checkout', {
      method: 'POST',
      data: { items, timeSlot }
    });
  },

  // Admin API
  async getAdminOrders() {
    return this.request('/admin/orders');
  },

  async getAdminUsers() {
    return this.request('/admin/users');
  },

  async makeUserAdmin(userId) {
    return this.request('/auth/make-admin', {
      method: 'POST',
      data: { userId }
    });
  },

  async removeAdmin(userId) {
    return this.request('/auth/remove-admin', {
      method: 'POST',
      data: { userId }
    });
  },

  async deleteUser(firebaseUid) {
    return this.request(`/admin/users/${firebaseUid}`, {
      method: 'DELETE'
    });
  },

  async createManualUser(userData) {
    return this.request('/auth/create-manual-user', {
      method: 'POST',
      data: userData
    });
  },

  async getSettings() {
    return this.request('/admin/settings');
  },

  async toggleManualPayments(enabled) {
    return this.request('/admin/manual-payments', {
      method: 'POST',
      data: { enabled }
    });
  },

  async isManualPaymentsEnabled() {
    const { manualPaymentsEnabled } = await this.request('/admin/settings');
    return manualPaymentsEnabled;
  },

  async createManualOrder(items, timeSlot) {
    return this.request('/checkout/manual-order', {
      method: 'POST',
      data: { items, timeSlot }
    });
  },

  async confirmManualPayment(orderId) {
    return this.request(`/orders/manual-order/${orderId}/confirm`, {
      method: 'POST'
    });
  },

  // Scout Management API methods
  async getLeden() {
    return this.request('/scout-management/leden');
  },
  
  async getLid(id) {
    return this.request(`/scout-management/leden/${id}`);
  },
  
  async createLid(lidData) {
    return this.request('/scout-management/leden', {
      method: 'POST',
      data: lidData
    });
  },
  
  async updateLid(id, lidData) {
    return this.request(`/scout-management/leden/${id}`, {
      method: 'PUT',
      data: lidData
    });
  },
  
  async deleteLid(id) {
    return this.request(`/scout-management/leden/${id}`, {
      method: 'DELETE'
    });
  },
  
  async getLeiding() {
    return this.request('/scout-management/leiding');
  },
  
  async getMaterialen() {
    return this.request('/scout-management/materialen');
  }
};
