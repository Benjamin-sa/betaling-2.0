const BASE_URL = import.meta.env.VITE_SERVER_URL;

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

  // Admin API
  async getAdminOrders() {
    return this.request("/admin/orders");
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

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: "DELETE",
    });
  },

  async getEventShiftAvailability(eventId) {
    return this.request(`/events/${eventId}/availability`);
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
};
