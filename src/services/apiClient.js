const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("userToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Ensure the endpoint starts with `/`
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;

    console.log(`🌐 ${options.method || "GET"} ${url}`);

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return response.json();
  },
};