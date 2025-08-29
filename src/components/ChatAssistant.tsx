import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI Support Assistant. I can help you understand how to use the UPI Fraud Detection Dashboard. You can also highlight any text on the page to get explanations!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle text selection across the page
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 3) {
        setSelectedText(text);
        showTooltip(selection);
      } else {
        hideTooltip();
      }
    };

    const showTooltip = (selection: Selection | null) => {
      hideTooltip(); // Remove existing tooltip
      
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const tooltip = document.createElement('div');
      tooltip.id = 'text-selection-tooltip';
      tooltip.className = 'fixed z-[100] bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium';
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.innerHTML = `
        <button class="flex items-center gap-1 hover:opacity-80">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Explain
        </button>
      `;
      
      tooltip.addEventListener('click', () => {
        handleExplainText(selectedText);
        hideTooltip();
        window.getSelection()?.removeAllRanges();
      });
      
      document.body.appendChild(tooltip);
      
      // Auto-hide after 3 seconds
      setTimeout(hideTooltip, 3000);
    };

    const hideTooltip = () => {
      const existing = document.getElementById('text-selection-tooltip');
      if (existing) {
        existing.remove();
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
      hideTooltip();
    };
  }, [selectedText]);

  const handleExplainText = (text: string) => {
    if (!text.trim()) return;
    
    setIsOpen(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Please explain: "${text}"`,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate contextual response
    setTimeout(() => {
      const response = generateContextualResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const generateContextualResponse = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Context-aware responses based on highlighted text
    if (lowerText.includes('dataset') || lowerText.includes('csv')) {
      return "A dataset is a collection of transaction data used to train the fraud detection model. You can upload CSV files with columns like TransactionID, UserID, Amount, Timestamp, Location, DeviceID, TransactionType, and FraudLabel. Our system also provides a sample dataset for quick testing.";
    }
    
    if (lowerText.includes('train') || lowerText.includes('model')) {
      return "Model training uses machine learning algorithms (specifically Logistic Regression with TensorFlow.js) to learn patterns from your transaction data. The training happens directly in your browser and provides metrics like Accuracy, Precision, Recall, and F1-score to evaluate performance.";
    }
    
    if (lowerText.includes('predict') || lowerText.includes('fraud')) {
      return "Fraud prediction analyzes transaction patterns to identify suspicious activities. Our system uses behavioral profiling, anomaly detection, and historical trends to assess fraud risk, providing confidence scores from 0-100% for each prediction.";
    }
    
    if (lowerText.includes('analytics') || lowerText.includes('dashboard')) {
      return "The analytics dashboard provides real-time insights into transaction patterns, fraud detection rates, and model performance. You can monitor live streams, view historical trends, and analyze fraud patterns through interactive charts and visualizations.";
    }
    
    if (lowerText.includes('upi') || lowerText.includes('transaction')) {
      return "UPI (Unified Payments Interface) transactions are analyzed for fraud patterns based on factors like transaction amount, timing, location, device information, and user behavior. The system identifies anomalies that might indicate fraudulent activity.";
    }
    
    // Generic helpful response
    return `I can help explain "${text}" in the context of fraud detection. This relates to our UPI fraud detection system that helps identify suspicious transactions using machine learning. Would you like me to explain any specific aspect in more detail?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Generate response based on common questions
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('how') && (lowerQuestion.includes('start') || lowerQuestion.includes('begin'))) {
      return "To get started: 1) Upload your CSV dataset or use our sample data, 2) Train the model by clicking 'Train Model', 3) Make predictions on the Predict page, 4) Monitor results in Analytics. Would you like me to guide you through any specific step?";
    }
    
    if (lowerQuestion.includes('what') && lowerQuestion.includes('format')) {
      return "The CSV format should include these columns: TransactionID, UserID, Amount, Timestamp, Location, DeviceID, TransactionType, FraudLabel. Don't worry if some columns are missing - our system adapts dynamically!";
    }
    
    if (lowerQuestion.includes('accuracy') || lowerQuestion.includes('reliable')) {
      return "Our fraud detection model provides accuracy metrics during training. Typical accuracy rates range from 85-95% depending on your dataset quality. The system shows Precision, Recall, and F1-scores to help you evaluate performance.";
    }
    
    if (lowerQuestion.includes('sample') || lowerQuestion.includes('demo')) {
      return "Yes! Click 'Use Sample & Train' on the home page to load a pre-built dataset with realistic transaction patterns. This is perfect for testing the system before uploading your own data.";
    }
    
    if (lowerQuestion.includes('real') && lowerQuestion.includes('time')) {
      return "The Live Stream page simulates real-time transaction monitoring. It processes your dataset to show how the system would detect fraud as transactions occur, complete with confidence scores and alerts.";
    }
    
    if (lowerQuestion.includes('security') || lowerQuestion.includes('safe')) {
      return "Your data is processed entirely in your browser using TensorFlow.js - no data leaves your device. All training and predictions happen locally, ensuring complete privacy and security of your transaction data.";
    }
    
    if (lowerQuestion.includes('cost') || lowerQuestion.includes('price') || lowerQuestion.includes('free')) {
      return "This is a demonstration version of our UPI fraud detection system. For enterprise pricing and deployment options, please contact our sales team through the Contact page.";
    }
    
    if (lowerQuestion.includes('support') || lowerQuestion.includes('help') || lowerQuestion.includes('contact')) {
      return "You can reach our support team through the Contact page, or continue chatting with me here! I'm available 24/7 to help with technical questions, usage guidance, and troubleshooting.";
    }
    
    if (lowerQuestion.includes('api') || lowerQuestion.includes('integration')) {
      return "Our fraud detection system can be integrated via REST APIs for real-time transaction screening. Contact us for API documentation and integration support for your existing payment systems.";
    }
    
    if (lowerQuestion.includes('train') && lowerQuestion.includes('time')) {
      return "Training time depends on your dataset size. Typically: Small datasets (1K-10K transactions) take 30-60 seconds, Medium datasets (10K-100K) take 2-5 minutes, and Large datasets (100K+) may take 5-15 minutes.";
    }
    
    if (lowerQuestion.includes('mobile') || lowerQuestion.includes('phone')) {
      return "Yes! Our dashboard is fully responsive and works on mobile devices. You can upload data, train models, and view analytics from your smartphone or tablet with the same functionality.";
    }
    
    if (lowerQuestion.includes('export') || lowerQuestion.includes('download')) {
      return "You can export your trained models and prediction results. The Analytics page provides download options for reports, and trained models can be saved for future use or deployment.";
    }
    
    if (lowerQuestion.includes('language') || lowerQuestion.includes('localization')) {
      return "Currently, our interface is available in English. We're working on multi-language support for global deployment. The system can process transaction data in any format regardless of region.";
    }
    
    if (lowerQuestion.includes('performance') || lowerQuestion.includes('speed')) {
      return "Our browser-based ML implementation is optimized for performance. Prediction speed is typically under 100ms per transaction, making it suitable for real-time fraud detection in high-volume environments.";
    }
    
    // Default helpful response
    return "I'm here to help with any questions about the UPI Fraud Detection Dashboard! You can ask about uploading data, training models, making predictions, understanding analytics, security, pricing, mobile usage, API integration, or anything else. What would you like to know more about?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        variant="hero"
        size="sm"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">Open AI Support Assistant</span>
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-background border rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <h3 className="font-semibold text-sm">AI Support Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={!inputValue.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;