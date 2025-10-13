// Dynamic BASE_URL based on environment
const getBaseURL = () => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    return "https://shop.lodlavki.be";
  }

  // Development fallback - check for custom server URL or use default
  return import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
};

const BASE_URL = getBaseURL();

// Token provider to avoid circular dependency
let tokenProvider = null;

// Function to set the token provider (called from auth store)
export const setTokenProvider = (provider) => {
  tokenProvider = provider;
};

// Helper function to make requests with automatic token refresh
const makeRequest = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Always try to add auth token if available
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Could not get auth token for request:", error);
    }
  }

  const config = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  if (options.data && !(options.data instanceof FormData)) {
    config.body = JSON.stringify(options.data);
  } else if (options.data) {
    config.body = options.data;
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}/api${endpoint}`, config);

  // Handle 401 errors by refreshing token and retrying once
  if (response.status === 401 && tokenProvider) {
    try {
      console.log("Token expired, refreshing...");
      // Force fresh token by calling provider again
      const freshToken = await tokenProvider();
      if (freshToken) {
        headers["Authorization"] = `Bearer ${freshToken}`;
        const retryResponse = await fetch(`${BASE_URL}/api${endpoint}`, {
          ...config,
          headers,
        });

        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
    } catch (retryError) {
      console.error("Token refresh failed:", retryError);
    }
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

export const apiClient = {
  async request(endpoint, options = {}) {
    return makeRequest(endpoint, options);
  },

  // Products API
  async getProducts(eventId = null) {
    const endpoint = eventId ? `/products?eventId=${eventId}` : "/products";
    return this.request(endpoint);
  },

  async addProduct(formData) {
    return this.request("/products", {
      method: "POST",
      data: formData,
    });
  },

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: "DELETE",
    });
  },

  // Orders API
  async getOrders() {
    return this.request("/orders");
  },

  async createCheckoutSession(items, eventId, shiftId = null) {
    const data = { items, eventId };
    if (shiftId) {
      data.shiftId = shiftId;
    }
    return this.request("/orders/checkout", {
      method: "POST",
      data,
    });
  },

  // Shift capacity checking API
  async checkShiftCapacity(eventId, shiftId, quantity = 1) {
    return this.request(
      `/orders/capacity/${eventId}/${shiftId}?quantity=${quantity}`
    );
  },

  async batchCheckShiftCapacity(shiftRequests) {
    return this.request("/orders/capacity/batch", {
      method: "POST",
      data: { shiftRequests },
    });
  },

  // Admin API
  async getAdminOrders() {
    return this.request("/admin/orders");
  },

  async getAdminOrdersFiltered(filters = {}, options = {}) {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    // Add options to params
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    return this.request(`/admin/orders/filtered?${params.toString()}`);
  },

  async getOrderStatistics(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    return this.request(`/admin/orders/statistics?${params.toString()}`);
  },

  async getAdminUsers() {
    return this.request("/admin/users");
  },

  async makeUserAdmin(userId) {
    return this.request("/admin/make-admin", {
      method: "POST",
      data: { userId },
    });
  },

  async removeAdmin(userId) {
    return this.request("/admin/remove-admin", {
      method: "POST",
      data: { userId },
    });
  },

  async deleteUser(firebaseUid) {
    return this.request(`/admin/users/${firebaseUid}`, {
      method: "DELETE",
    });
  },

  // Email Log API
  async getEmailLogs(filters = {}, options = {}) {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    return this.request(`/admin/email-logs?${params.toString()}`);
  },

  async getEmailLogsByOrderId(orderId) {
    return this.request(`/admin/email-logs/order/${orderId}`);
  },

  async getEmailStatistics() {
    return this.request("/admin/email-logs/statistics");
  },

  // Stripe Configuration API
  async getStripeConfig() {
    return this.request("/admin/stripe/config");
  },

  async switchStripeMode(mode) {
    return this.request("/admin/stripe/switch-mode", {
      method: "POST",
      data: { mode },
    });
  },

  async getStripePublicKey() {
    return this.request("/stripe/public-key");
  },

  // Event API
  async getEvents() {
    return this.request("/events");
  },

  async getActiveEvents() {
    return this.request("/events/active");
  },

  async createEvent(eventData) {
    return this.request("/events", {
      method: "POST",
      data: eventData,
    });
  },

  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: "PUT",
      data: eventData,
    });
  },

  async updateEventStatus(eventId, isActive) {
    return this.request(`/events/${eventId}/status`, {
      method: "PATCH",
      data: { isActive },
    });
  },

  async addShift(eventId, shiftData) {
    return this.request(`/events/${eventId}/shifts`, {
      method: "POST",
      data: shiftData,
    });
  },

  async updateShift(eventId, shiftId, shiftData) {
    return this.request(`/events/${eventId}/shifts/${shiftId}`, {
      method: "PATCH",
      data: shiftData,
    });
  },

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: "DELETE",
    });
  },

  async getEventShiftAvailability(eventId) {
    return this.request(`/events/${eventId}/availability`);
  },

  async getShiftById(eventId, shiftId) {
    return this.request(`/events/${eventId}/shifts/${shiftId}`);
  },

  // Auth API
  async register(email, password) {
    return this.request("/auth/register", {
      method: "POST",
      data: { email, password },
    });
  },

  async ensureUser() {
    return this.request("/auth/ensure-user", {
      method: "POST",
    });
  },

  async getAdminStatus() {
    return this.request("/auth/admin-status");
  },

  // Google Services API (Unified)
  async getGoogleAuthStatus() {
    return this.request("/admin/google/status");
  },
  async setupGoogleAuth() {
    return this.request("/admin/google/setup");
  },
  async reloadGoogleTokens() {
    return this.request("/admin/google/reload-tokens", {
      method: "POST",
    });
  },
};
