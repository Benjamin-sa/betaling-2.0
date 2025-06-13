const BASE_URL = import.meta.env.VITE_SERVER_URL;

// Token provider to avoid circular dependency
let tokenProvider = null;

// Function to set the token provider (called from auth store)
export const setTokenProvider = (provider) => {
  tokenProvider = provider;
};

// Helper function to make requests without circular dependency
const makeRequest = async (endpoint, options = {}, useAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Only add auth header if needed and if we have a token provider
  if (useAuth && tokenProvider) {
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
    return makeRequest(endpoint, options, true);
  },

  // Products API
  async getProducts() {
    return this.request("/products");
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

  async createCheckoutSession(items) {
    return this.request("/orders/checkout", {
      method: "POST",
      data: { items },
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
