import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader,
  Settings,
  Shield,
  Zap
} from "lucide-react";

const CommandCenter = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [humanApprovalRequired, setHumanApprovalRequired] = useState(true);
  const messagesEndRef = useRef(null);

  // Mock conversation history
  const initialMessages = [
    {
      id: 1,
      type: "user",
      content: "What happened in East Zone?",
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 2,
      type: "ai",
      content: "East Zone Activity Summary: 2 incident(s) in the last 24 hours - crowd surge (high severity) at 2:15 PM, equipment failure (low severity) at 1:30 PM. Current status: crowd surge is being addressed by Team Alpha.",
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
      confidence: 94
    },
    {
      id: 3,
      type: "user", 
      content: "Overall status summary",
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 4,
      type: "ai",
      content: "Event Status Overview: 15 total incidents in last 24h, 3 currently active. Monitoring 4 zones with 8 active responders. System operational status: GREEN. Average response time: 6.2 minutes.",
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      confidence: 98
    }
  ];

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(query.toLowerCase());
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        confidence: aiResponse.confidence,
        requiresApproval: aiResponse.requiresApproval
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (query) => {
    // Mock AI responses based on query keywords
    if (query.includes("fire")) {
      return {
        content: "⚠️ FIRE ALERT: 1 active fire incident detected in North Zone equipment area. Emergency protocols activated. Fire suppression system engaged. Evacuation procedures initiated for affected area. Estimated containment time: 15 minutes.",
        confidence: 96,
        requiresApproval: true
      };
    }
    
    if (query.includes("crowd") || query.includes("surge")) {
      return {
        content: "Crowd Management Status: Current density levels show 1 high-risk area in East Zone (87% confidence). Crowd control barriers deployed. Additional security teams dispatched. Estimated crowd flow normalization: 20 minutes.",
        confidence: 87,
        requiresApproval: false
      };
    }
    
    if (query.includes("medical") || query.includes("health")) {
      return {
        content: "Medical Response Summary: 2 active medical incidents. West Zone: minor injury, Team Beta responding (ETA 3 min). South Zone: person requiring assistance, Team Delta on scene. All medical stations operational.",
        confidence: 92,
        requiresApproval: false
      };
    }
    
    if (query.includes("responder") || query.includes("team")) {
      return {
        content: "Responder Status: 8/10 teams active and deployed. Team Alpha: East Zone (responding to crowd surge). Team Beta: West Zone (medical response). Team Gamma: North Zone (fire incident). All teams report operational status GREEN.",
        confidence: 99,
        requiresApproval: false
      };
    }
    
    if (query.includes("status") || query.includes("overview")) {
      return {
        content: "System Overview: All monitoring systems operational. 4 zones under surveillance. 3 active incidents (1 critical, 2 medium priority). Response time average: 5.8 minutes. Weather conditions: Clear. Event capacity: 68% (5,570/8,500 attendees).",
        confidence: 95,
        requiresApproval: false
      };
    }

    // Default response
    return {
      content: `I understand you're asking about "${query}". Based on current monitoring data, I can provide information about incidents, zones, responders, fire safety, crowd management, medical emergencies, and system status. Please specify what aspect you'd like me to analyze.`,
      confidence: 85,
      requiresApproval: false
    };
  };

  const handleApproval = (messageId, approved) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, approved, approvalTimestamp: new Date() }
        : msg
    ));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQueries = [
    "What's the current status?",
    "Any fire incidents?", 
    "Crowd density levels?",
    "Responder locations?",
    "Medical emergencies?"
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Command Center</h3>
              <p className="text-gray-400 text-sm">Natural language queries</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHumanApprovalRequired(!humanApprovalRequired)}
              className={`p-2 rounded-lg transition-colors ${
                humanApprovalRequired 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Toggle human approval for high-risk alerts"
            >
              <Shield className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Human Approval Toggle */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Human Approval:</span>
          <span className={humanApprovalRequired ? "text-orange-400" : "text-green-400"}>
            {humanApprovalRequired ? "REQUIRED" : "DISABLED"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Brain className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                      <span>{formatTime(message.timestamp)}</span>
                      {message.type === 'ai' && message.confidence && (
                        <span className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{message.confidence}%</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Approval Controls */}
                    {message.requiresApproval && humanApprovalRequired && !message.approved && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleApproval(message.id, true)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(message.id, false)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {message.approved !== undefined && (
                      <div className={`mt-2 text-xs flex items-center space-x-1 ${
                        message.approved ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <CheckCircle className="h-3 w-3" />
                        <span>{message.approved ? 'Approved' : 'Rejected'}</span>
                        <span className="text-gray-500">
                          {formatTime(message.approvalTimestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-2">
              <Loader className="h-4 w-4 text-purple-400 animate-spin" />
              <span className="text-gray-300 text-sm">AI is analyzing...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length <= 4 && (
        <div className="p-4 border-t border-gray-700/50">
          <p className="text-gray-400 text-xs mb-2">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about incidents, zones, responders..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommandCenter;
