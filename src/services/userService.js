import { apiClient } from "./apiClient";

export const userService = {
  async fetchUsers() {
    // Point directly to the working /volunteers backend route
    return apiClient.request("/volunteers");
  },

  async createUser(userData) {
    return apiClient.request("/volunteers", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id, updatedData) {
    return apiClient.request(`/volunteers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
  },

  async deleteUser(id) {
    return apiClient.request(`/volunteers/${id}`, {
      method: "DELETE",
    });
  }
};
