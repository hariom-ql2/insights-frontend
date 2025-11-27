const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private getAuthHeaders(token: string | null) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Convert request data to UTC before sending
  private async convertRequestToUTC(data: any): Promise<any> {
    if (!data) return data;
    
    // Import timezone service dynamically to avoid circular imports
    try {
      const { timezoneService } = await import('./timezoneService');
      return timezoneService.convertUserInputToUTC(data);
    } catch (error) {
      console.warn('Timezone conversion not available:', error);
      return data;
    }
  }

  // Convert response data from UTC to user timezone
  private async convertResponseFromUTC(data: any): Promise<any> {
    if (!data) return data;
    
    // Import timezone service dynamically to avoid circular imports
    try {
      const { timezoneService } = await import('./timezoneService');
      return timezoneService.convertAPIResponse(data);
    } catch (error) {
      console.warn('Timezone conversion not available:', error);
      return data;
    }
  }

  async get<T = any>(endpoint: string, token: string | null = null): Promise<ApiResponse<T>> {
    try {
      console.log(`API GET: ${API_BASE_URL}${endpoint}`, { token: token ? 'Token exists' : 'No token' });
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      console.log(`API GET response status: ${response.status}`);
      const data = await response.json();
      console.log('API GET raw response:', data);
      
      // Convert response timestamps to user timezone
      const convertedData = await this.convertResponseFromUTC(data);
      console.log('API GET converted response:', convertedData);
      
      return convertedData;
    } catch (error) {
      console.error('API GET error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async post<T = any>(endpoint: string, body: any, token: string | null = null): Promise<ApiResponse<T>> {
    try {
      // Convert request data to UTC
      const utcBody = await this.convertRequestToUTC(body);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(utcBody),
      });

      const data = await response.json();
      
      // Convert response timestamps to user timezone
      const convertedData = await this.convertResponseFromUTC(data);
      
      return convertedData;
    } catch (error) {
      console.error('API POST error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async put<T = any>(endpoint: string, body: any, token: string | null = null): Promise<ApiResponse<T>> {
    try {
      // Convert request data to UTC
      const utcBody = await this.convertRequestToUTC(body);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(utcBody),
      });

      const data = await response.json();
      
      // If response is not OK, return error response
      if (!response.ok) {
        return { success: false, message: data.message || `HTTP error! status: ${response.status}` };
      }
      
      // Convert response timestamps to user timezone
      const convertedData = await this.convertResponseFromUTC(data);
      
      return convertedData;
    } catch (error) {
      console.error('API PUT error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async delete<T = any>(endpoint: string, token: string | null = null): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });

      const data = await response.json();
      
      // Convert response timestamps to user timezone
      const convertedData = await this.convertResponseFromUTC(data);
      
      return convertedData;
    } catch (error) {
      console.error('API DELETE error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async getHTML(endpoint: string, token: string | null = null): Promise<{ success: boolean; html?: string; message?: string }> {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return { success: false, message: `HTTP error! status: ${response.status}` };
      }

      const html = await response.text();
      return { success: true, html };
    } catch (error) {
      console.error('API GET HTML error:', error);
      return { success: false, message: 'Network error' };
    }
  }
}

// Schedule-related API methods
export const schedulesApi = {
  // Get all schedules for the current user
  getSchedules: async (token: string | null): Promise<ApiResponse<any[]>> => {
    return apiService.get('/schedules', token);
  },

  // Create a new schedule
  createSchedule: async (scheduleData: any, token: string | null): Promise<ApiResponse<any>> => {
    return apiService.post('/schedules', scheduleData, token);
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId: number, token: string | null): Promise<ApiResponse<any>> => {
    return apiService.delete(`/schedules/${scheduleId}`, token);
  },

  // Get schedule runs (execution history)
  getScheduleRuns: async (scheduleId: number, token: string | null): Promise<ApiResponse<any[]>> => {
    return apiService.get(`/schedules/${scheduleId}/runs`, token);
  }
};

// Dashboard API methods
export const dashboardApi = {
  getStats: async (token: string | null): Promise<ApiResponse<any>> => {
    return apiService.get('/dashboard/stats', token);
  },
};

// Reports API methods
export const reportsApi = {
  getCompetitorRateTracker: async (token: string | null): Promise<{ success: boolean; token?: string; url?: string; message?: string }> => {
    return apiService.get('/reports/competitor-rate-tracker', token);
  },
  getMarketView: async (token: string | null): Promise<{ success: boolean; token?: string; url?: string; message?: string }> => {
    return apiService.get('/reports/market-view', token);
  },
  getStarRatingTrend: async (token: string | null): Promise<{ success: boolean; token?: string; url?: string; message?: string }> => {
    return apiService.get('/reports/star-rating-trend', token);
  },
  getPriceSuggestion: async (token: string | null): Promise<{ success: boolean; token?: string; url?: string; message?: string }> => {
    return apiService.get('/reports/price-suggestion', token);
  },
};

// Admin API methods
export const adminApi = {
  // Dashboard
  getDashboardStats: async (token: string | null): Promise<ApiResponse<any>> => {
    return apiService.get('/admin/dashboard', token);
  },

  // Users
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    verified?: boolean;
  }, token: string | null): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return apiService.get(endpoint, token);
  },

  getUserDetails: async (userId: number, token: string | null): Promise<ApiResponse<any>> => {
    return apiService.get(`/admin/users/${userId}`, token);
  },

  updateUser: async (userId: number, userData: any, token: string | null): Promise<ApiResponse<any>> => {
    return apiService.put(`/admin/users/${userId}`, userData, token);
  },

  // Searches
  getSearches: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    scheduled?: boolean;
  }, token: string | null): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.scheduled !== undefined) queryParams.append('scheduled', params.scheduled.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/searches?${queryString}` : '/admin/searches';
    return apiService.get(endpoint, token);
  },

  // Collections
  getCollections: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
  }, token: string | null): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/collections?${queryString}` : '/admin/collections';
    return apiService.get(endpoint, token);
  },

        // Activities
        getActivities: async (params: {
          page?: number;
          limit?: number;
          admin_id?: number;
          action?: string;
          resource?: string;
        }, token: string | null): Promise<ApiResponse<any>> => {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.admin_id) queryParams.append('admin_id', params.admin_id.toString());
          if (params.action) queryParams.append('action', params.action);
          if (params.resource) queryParams.append('resource', params.resource);

          const queryString = queryParams.toString();
          const endpoint = queryString ? `/admin/activities?${queryString}` : '/admin/activities';
          return apiService.get(endpoint, token);
        },

        // Schedules
        getSchedules: async (params: {
          page?: number;
          limit?: number;
          user_id?: string;
          status?: string;
        }, token: string | null): Promise<ApiResponse<any>> => {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.user_id) queryParams.append('user_id', params.user_id);
          if (params.status) queryParams.append('status', params.status);

          const queryString = queryParams.toString();
          const endpoint = queryString ? `/admin/schedules?${queryString}` : '/admin/schedules';
          return apiService.get(endpoint, token);
        }
};

export const apiService = new ApiService();
