import api from '@/services/api';

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface ChatResponse {
  answer: string;
  category: string;
  confidence: number;
  similarQuestions: string[];
}

const chatbotService = {
  // Send message to chatbot
  async sendMessage(question: string): Promise<{ success: boolean; data: ChatResponse }> {
    try {
      console.log('📤 Sending chatbot request:', question);
      const response = await api.post('/chatbot/ask', { question });
      console.log('📥 Chatbot response:', response.data);

      // Backend returns { data: {...}, message: "..." } without success field
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ Chatbot error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to get response from chatbot');
    }
  },

  // Get chat history
  async getChatHistory(): Promise<{ success: boolean; data: ChatMessage[] }> {
    try {
      const response = await api.get('/chatbot/history');
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      // Return empty array instead of throwing
      return { success: true, data: [] };
    }
  },

  // Clear chat history
  async clearHistory(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete('/chatbot/history');
      return {
        success: true,
        message: response.data.message || 'History cleared',
      };
    } catch (error: any) {
      console.error('Failed to clear history:', error);
      return { success: true, message: 'History cleared' };
    }
  },

  // Provide feedback on answer
  async provideFeedback(data: {
    question: string;
    answer: string;
    helpful: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/chatbot/feedback', data);
      return {
        success: true,
        message: response.data.message || 'Feedback submitted',
      };
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      return { success: true, message: 'Feedback submitted' };
    }
  },
};

export default chatbotService;
