const API_BASE_URL = 'https://apiloantrix.seotube.in/api';
// const API_BASE_URL = 'http://localhost:5009/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const authApi = {
  signup: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    }
    return data;
  },

  me: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
};

export const categoriesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch category');
    return data;
  },

  create: async (name: string, description: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create category');
    return data;
  },

  update: async (id: string, updates: { name?: string; description?: string; isActive?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update category');
    return data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete category');
    return data;
  },
};

export const loansApi = {
  getAll: async (categoryId?: string) => {
    const url = categoryId 
      ? `${API_BASE_URL}/admin/loans?category=${categoryId}`
      : `${API_BASE_URL}/admin/loans`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch loans');
    return data;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/loans/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch loan');
    return data;
  },

  create: async (loanData: {
    category: string;
    loanTitle: string;
    loanCompany: string;
    bankName: string;
    bankLogo: File | null;
    loanDescription: string;
    loanQuote: string;
    link: string;
  }) => {
    const formData = new FormData();
    formData.append('category', loanData.category);
    formData.append('loanTitle', loanData.loanTitle);
    formData.append('loanCompany', loanData.loanCompany);
    formData.append('bankName', loanData.bankName);
    if (loanData.bankLogo) {
      formData.append('bankLogo', loanData.bankLogo);
    }
    formData.append('loanDescription', loanData.loanDescription);
    formData.append('loanQuote', loanData.loanQuote);
    formData.append('link', loanData.link);

    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE_URL}/admin/loans`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create loan');
    return data;
  },

  update: async (id: string, updates: {
    category?: string;
    loanTitle?: string;
    loanCompany?: string;
    bankName?: string;
    bankLogo?: File | null;
    loanDescription?: string;
    loanQuote?: string;
    link?: string;
    isActive?: boolean;
  }) => {
    const formData = new FormData();
    if (updates.category !== undefined) formData.append('category', updates.category);
    if (updates.loanTitle !== undefined) formData.append('loanTitle', updates.loanTitle);
    if (updates.loanCompany !== undefined) formData.append('loanCompany', updates.loanCompany);
    if (updates.bankName !== undefined) formData.append('bankName', updates.bankName);
    if (updates.bankLogo !== undefined && updates.bankLogo) {
      formData.append('bankLogo', updates.bankLogo);
    }
    if (updates.loanDescription !== undefined) formData.append('loanDescription', updates.loanDescription);
    if (updates.loanQuote !== undefined) formData.append('loanQuote', updates.loanQuote);
    if (updates.link !== undefined) formData.append('link', updates.link);
    if (updates.isActive !== undefined) formData.append('isActive', updates.isActive.toString());

    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE_URL}/admin/loans/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update loan');
    return data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/loans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete loan');
    return data;
  },
};

export const commodityPricesApi = {
  getAll: async (filters?: {
    commodityType?: string;
    state?: string;
    city?: string;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.commodityType) params.append('commodityType', filters.commodityType);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const url = params.toString()
      ? `${API_BASE_URL}/admin/commodity-prices?${params.toString()}`
      : `${API_BASE_URL}/admin/commodity-prices`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch commodity prices');
    return data;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/commodity-prices/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch commodity price');
    return data;
  },

  create: async (commodityData: {
    commodityType: string;
    state: string;
    city: string;
    price: number;
    unit: string;
    isActive?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/commodity-prices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commodityData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create commodity price');
    return data;
  },

  update: async (id: string, updates: {
    commodityType?: string;
    state?: string;
    city?: string;
    price?: number;
    unit?: string;
    isActive?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/commodity-prices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update commodity price');
    return data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/commodity-prices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete commodity price');
    return data;
  },
};

export const applyNowApi = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/apply-now`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch Apply Now settings');
    return data;
  },

  create: async (settings: { isActive: boolean; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/apply-now`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create Apply Now settings');
    return data;
  },

  update: async (updates: { isActive?: boolean; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/apply-now`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update Apply Now settings');
    return data;
  },
};
