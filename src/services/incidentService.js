import { apiClient } from "./apiClient";

export const incidentService = {
  async fetchIncidents() {
    return apiClient.request("/incidents");
  },

  async createIncident(incidentData) {
    return apiClient.request("/incidents", {
      method: "POST",
      body: JSON.stringify(incidentData),
    });
  },

  async updateIncident(id, updatedData) {
    return apiClient.request(`/incidents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
  },

  async deleteIncident(id) {
    return apiClient.request(`/incidents/${id}`, {
      method: "DELETE",
    });
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    
    // Calls your API Gateway S3 proxy endpoint to receive an upload URL
    const uploadConfig = await apiClient.request("/incidents/upload-url", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    });

    await fetch(uploadConfig.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    });

    return uploadConfig.fileUrl;
  },

  async fetchResponseUpdates() {
    return apiClient.request("/incidents/updates");
  },

  async createResponseUpdate(updateData) {
    return apiClient.request("/incidents/updates", {
      method: "POST",
      body: JSON.stringify(updateData),
    });
  },

  async updateResponseUpdate(id, patch) {
    return apiClient.request(`/incidents/updates/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  async deleteResponseUpdate(id) {
    return apiClient.request(`/incidents/updates/${id}`, {
      method: "DELETE",
    });
  }
};
