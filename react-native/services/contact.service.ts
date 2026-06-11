import api from '@/services/api';

export interface Contact {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  office?: string;
  category: 'administration' | 'academic' | 'hostel' | 'emergency' | 'other';
}

const contactService = {
  // Get all contacts
  async getAll(): Promise<{ success: boolean; data: Contact[] }> {
    try {
      const response = await api.get('/contact');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
  },

  // Get contacts by category
  async getByCategory(category: string): Promise<{ success: boolean; data: Contact[] }> {
    try {
      const response = await api.get(`/contact?category=${category}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
  },

  // Submit contact form
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/contact/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit contact form');
    }
  },
};

export default contactService;
