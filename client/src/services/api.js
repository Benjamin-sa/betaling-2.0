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
  async getLeden(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.tak) queryParams.append('tak', filters.tak);
    if (filters.isActief !== undefined) queryParams.append('isActief', filters.isActief);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/scout-management/leden?${queryString}` : '/scout-management/leden';
    
    return this.request(endpoint);
  },
  
  async getLid(id) {
    return this.request(`/scout-management/leden/${id}`);
  },
  
  async getLidDetails(id) {
    return this.request(`/scout-management/leden/${id}/details`);
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
  
  // Member attributes management
  async updateLidAllergies(id, allergies) {
    return this.request(`/scout-management/leden/${id}/allergies`, {
      method: 'PUT',
      data: { allergies }
    });
  },
  
  async updateLidDietary(id, dietary) {
    return this.request(`/scout-management/leden/${id}/dietary`, {
      method: 'PUT',
      data: { dietary }
    });
  },
  
  // Promote member to leader
  async promoteLidToLeiding(id, leaderData = {}) {
    return this.request(`/scout-management/leden/${id}/promote-to-leiding`, {
      method: 'POST',
      data: leaderData
    });
  },
  
  async demoteFromLeiding(id) {
    return this.request(`/scout-management/leden/${id}/demote-from-leiding`, {
      method: 'DELETE'
    });
  },
  
  // Member-parent relationship management
  async getLidOuders(lidId) {
    return this.request(`/scout-management/leden/${lidId}/ouders`);
  },
  
  async linkOuderToLid(lidId, ouderData) {
    return this.request(`/scout-management/leden/${lidId}/ouders`, {
      method: 'POST',
      data: ouderData
    });
  },
  
  async unlinkOuderFromLid(lidId, ouderId) {
    return this.request(`/scout-management/leden/${lidId}/ouders/${ouderId}`, {
      method: 'DELETE'
    });
  },

  // Member participation in camps
  async getLidKampen(lidId) {
    return this.request(`/scout-management/leden/${lidId}/kampen`);
  },
  
  async addLidToKamp(lidId, kampId, deelnameData = {}) {
    return this.request(`/scout-management/leden/${lidId}/kampen/${kampId}`, {
      method: 'POST',
      data: deelnameData
    });
  },
  
  async updateLidKampDeelname(lidId, kampId, deelnameData) {
    return this.request(`/scout-management/leden/${lidId}/kampen/${kampId}`, {
      method: 'PUT',
      data: deelnameData
    });
  },
  
  async removeLidFromKamp(lidId, kampId) {
    return this.request(`/scout-management/leden/${lidId}/kampen/${kampId}`, {
      method: 'DELETE'
    });
  },
  
  async getLeiding() {
    return this.request('/scout-management/leiding');
  },
  
  async getMaterialen() {
    return this.request('/scout-management/materialen');
  },
  
  async getMateriaal(id) {
    return this.request(`/scout-management/materialen/${id}`);
  },
  
  async createMateriaal(materiaalData) {
    return this.request('/scout-management/materialen', {
      method: 'POST',
      data: materiaalData
    });
  },
  
  async createTent(tentData) {
    return this.request('/scout-management/materialen/tent', {
      method: 'POST',
      data: tentData
    });
  },
  
  async updateMateriaal(id, materiaalData) {
    return this.request(`/scout-management/materialen/${id}`, {
      method: 'PUT',
      data: materiaalData
    });
  },
  
  async updateTentpalen(id, tentpalenData) {
    return this.request(`/scout-management/materialen/${id}/tentpalen`, {
      method: 'PUT',
      data: tentpalenData
    });
  },
  
  async deleteMateriaal(id) {
    return this.request(`/scout-management/materialen/${id}`, {
      method: 'DELETE'
    });
  },

  async getMaterialTypes() {
    return this.request('/scout-management/materialen/types');
  },
  
  // Wei management methods
  async getWeien() {
    return this.request('/scout-management/weien');
  },
  
  async getWei(id) {
    return this.request(`/scout-management/weien/${id}`);
  },
  
  async createWei(weiData) {
    return this.request('/scout-management/weien', {
      method: 'POST',
      data: weiData
    });
  },
  
  async updateWei(id, weiData) {
    return this.request(`/scout-management/weien/${id}`, {
      method: 'PUT',
      data: weiData
    });
  },
  
  async linkWeiToKamp(weiId, kampId, data) {
    return this.request(`/scout-management/weien/${weiId}/kamp/${kampId}`, {
      method: 'POST',
      data: data
    });
  },
  
  async deleteWei(id) {
    return this.request(`/scout-management/weien/${id}`, {
      method: 'DELETE'
    });
  },

  // Recepten (Recipes) API methods
  async getRecepten() {
    return this.request('/scout-management/recepten');
  },
  
  async getRecept(id) {
    return this.request(`/scout-management/recepten/${id}`);
  },
  
  async createRecept(receptData) {
    return this.request('/scout-management/recepten', {
      method: 'POST',
      data: receptData
    });
  },
  
  async updateRecept(id, receptData) {
    return this.request(`/scout-management/recepten/${id}`, {
      method: 'PUT',
      data: receptData
    });
  },
  
  async deleteRecept(id) {
    return this.request(`/scout-management/recepten/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Duplicate a recipe
   * @param {number} receptId - The ID of the recipe to duplicate
   * @returns {Promise<Object>} - The duplicated recipe
   */
  async duplicateRecept(receptId) {
    return this.request(`/scout-management/recepten/${receptId}/duplicate`, {
      method: 'POST'
    });
  },

  // Meal Management API methods
  async getMaaltijden() {
    return this.request('/scout-management/maaltijden');
  },

  async getMaaltijd(id) {
    return this.request(`/scout-management/maaltijden/${id}`);
  },

  async getMaaltijdenByDateRange(startDate, endDate) {
    return this.request(`/scout-management/maaltijden/between/${startDate}/${endDate}`);
  },

  async createMaaltijd(maaltijdData) {
    return this.request('/scout-management/maaltijden', {
      method: 'POST',
      data: maaltijdData
    });
  },

  async updateMaaltijd(id, maaltijdData) {
    return this.request(`/scout-management/maaltijden/${id}`, {
      method: 'PUT',
      data: maaltijdData
    });
  },

  async deleteMaaltijd(id) {
    return this.request(`/scout-management/maaltijden/${id}`, {
      method: 'DELETE'
    });
  },

  // Meal participants
  async getMaaltijdDeelnemers(maaltijdId) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/deelnemers`);
  },

  async addMaaltijdDeelnemer(maaltijdId, lidId, data) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/deelnemers/${lidId}`, {
      method: 'POST',
      data: data
    });
  },

  async updateMaaltijdDeelnemer(maaltijdId, lidId, data) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/deelnemers/${lidId}`, {
      method: 'PUT',
      data: data
    });
  },

  async removeMaaltijdDeelnemer(maaltijdId, lidId) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/deelnemers/${lidId}`, {
      method: 'DELETE'
    });
  },

  // Preparation team
  async getMaaltijdBereidingsteam(maaltijdId) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/bereidingsteam`);
  },

  async addToBereidingsteam(maaltijdId, lidId) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/bereidingsteam/${lidId}`, {
      method: 'POST'
    });
  },

  async removeFromBereidingsteam(maaltijdId, lidId) {
    return this.request(`/scout-management/maaltijden/${maaltijdId}/bereidingsteam/${lidId}`, {
      method: 'DELETE'
    });
  },

  // Camp meals
  async getKampMaaltijden(kampId) {
    return this.request(`/scout-management/kampen/${kampId}/maaltijden`);
  },

  async linkMaaltijdToKamp(kampId, maaltijdId) {
    try {
      return await this.request(`/scout-management/kampen/${kampId}/maaltijden/${maaltijdId}`, {
        method: 'POST'
      });
    } catch (error) {
      if (error.message.includes('al gekoppeld')) {
        throw new Error('Deze maaltijd is al gekoppeld aan dit kamp');
      }
      throw error;
    }
  },

  async createBulkMaaltijdenForKamp(kampId, meals) {
    return this.request(`/scout-management/kampen/${kampId}/maaltijden/bulk`, {
      method: 'POST',
      data: { meals }
    });
  },

  async removeMaaltijdFromKamp(kampId, maaltijdId) {
    return this.request(`/scout-management/kampen/${kampId}/maaltijden/${maaltijdId}`, {
      method: 'DELETE'
    });
  },

  // Get Wei for camp
  async getKampWei(kampId) {
    return this.request(`/scout-management/kampen/${kampId}/wei`);
  },

  // Camp management methods
  async getKampen() {
    return this.request('/scout-management/kampen');
  },

  async getKamp(id) {
    return this.request(`/scout-management/kampen/${id}`);
  },

  async createKamp(kampData) {
    return this.request('/scout-management/kampen', {
      method: 'POST',
      data: kampData
    });
  },

  async updateKamp(id, kampData) {
    return this.request(`/scout-management/kampen/${id}`, {
      method: 'PUT',
      data: kampData
    });
  },

  async deleteKamp(id) {
    return this.request(`/scout-management/kampen/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get registration status
   * @returns {Promise<Object>} The registration status
   */
  async getRegistrationStatus() {
    try {
      return response = 'true';
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get registration status');
    }
  }
};
