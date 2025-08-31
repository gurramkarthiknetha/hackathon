import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Radio,
  Shield,
  Heart,
  Flame,
  Users,
  Navigation,
  FileText,
  Send
} from "lucide-react";

const QuickActions = () => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Emergency action buttons
  const emergencyActions = [
    {
      id: "emergency_report",
      title: "Report Emergency",
      description: "Report new incident",
      icon: AlertTriangle,
      color: "bg-red-600 hover:bg-red-700",
      urgent: true
    },
    {
      id: "medical_request",
      title: "Medical Backup",
      description: "Request medical support",
      icon: Heart,
      color: "bg-pink-600 hover:bg-pink-700",
      urgent: true
    },
    {
      id: "security_alert",
      title: "Security Alert",
      description: "Report security concern",
      icon: Shield,
      color: "bg-purple-600 hover:bg-purple-700",
      urgent: true
    },
    {
      id: "fire_alert",
      title: "Fire Alert",
      description: "Report fire/smoke",
      icon: Flame,
      color: "bg-orange-600 hover:bg-orange-700",
      urgent: true
    }
  ];

  // Communication actions
  const communicationActions = [
    {
      id: "contact_dispatch",
      title: "Contact Dispatch",
      description: "Call command center",
      icon: Phone,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "team_chat",
      title: "Team Chat",
      description: "Message other responders",
      icon: MessageSquare,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "radio_check",
      title: "Radio Check",
      description: "Test communication",
      icon: Radio,
      color: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      id: "photo_report",
      title: "Photo Report",
      description: "Take incident photo",
      icon: Camera,
      color: "bg-teal-600 hover:bg-teal-700"
    }
  ];

  // Status actions
  const statusActions = [
    {
      id: "mark_complete",
      title: "Mark Complete",
      description: "Complete current task",
      icon: CheckCircle,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "request_backup",
      title: "Request Backup",
      description: "Need additional support",
      icon: Users,
      color: "bg-yellow-600 hover:bg-yellow-700"
    },
    {
      id: "update_location",
      title: "Update Location",
      description: "Share current position",
      icon: MapPin,
      color: "bg-cyan-600 hover:bg-cyan-700"
    },
    {
      id: "break_time",
      title: "Break Time",
      description: "Take scheduled break",
      icon: Clock,
      color: "bg-gray-600 hover:bg-gray-700"
    }
  ];

  const handleActionClick = (action) => {
    if (action.id === "emergency_report") {
      setSelectedAction(action);
    } else {
      // Handle other actions immediately
      handleQuickAction(action);
    }
  };

  const handleQuickAction = (action) => {
    console.log("Quick action:", action.id);
    
    // Simulate action feedback
    const actionMessages = {
      contact_dispatch: "Connecting to dispatch...",
      team_chat: "Opening team chat...",
      radio_check: "Performing radio check...",
      photo_report: "Opening camera...",
      mark_complete: "Marking task as complete...",
      request_backup: "Requesting backup support...",
      update_location: "Updating location...",
      break_time: "Setting status to break...",
      medical_request: "Requesting medical backup...",
      security_alert: "Sending security alert...",
      fire_alert: "Sending fire alert..."
    };

    // Show toast or feedback (in a real app)
    alert(actionMessages[action.id] || "Action triggered");
  };

  const handleEmergencyReport = async () => {
    if (!reportType || !reportDescription.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Emergency report submitted:", { reportType, reportDescription });
      alert("Emergency report submitted successfully!");
      setSelectedAction(null);
      setReportType("");
      setReportDescription("");
      setIsSubmitting(false);
    }, 2000);
  };

  const ActionButton = ({ action, size = "normal" }) => (
    <motion.button
      onClick={() => handleActionClick(action)}
      className={`${action.color} text-white rounded-xl p-4 transition-all duration-200 shadow-lg ${
        size === "large" ? "col-span-2" : ""
      } ${action.urgent ? "ring-2 ring-red-400/50 animate-pulse" : ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center space-y-2">
        <action.icon className={`${size === "large" ? "h-8 w-8" : "h-6 w-6"} text-white`} />
        <div className="text-center">
          <div className={`font-semibold ${size === "large" ? "text-base" : "text-sm"}`}>
            {action.title}
          </div>
          <div className={`text-xs opacity-90 ${size === "large" ? "block" : "hidden sm:block"}`}>
            {action.description}
          </div>
        </div>
      </div>
    </motion.button>
  );

  if (selectedAction?.id === "emergency_report") {
    return (
      <div className="h-full flex flex-col bg-gray-800/60 backdrop-blur-xl lg:rounded-xl lg:border lg:border-gray-700/50">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Emergency Report</h3>
                <p className="text-gray-400 text-sm">Report new incident</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAction(null)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Incident Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-red-500 focus:outline-none"
            >
              <option value="">Select incident type</option>
              <option value="fire">Fire/Smoke</option>
              <option value="medical_emergency">Medical Emergency</option>
              <option value="security_threat">Security Threat</option>
              <option value="crowd_surge">Crowd Issue</option>
              <option value="equipment_failure">Equipment Failure</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Emergency Protocol</span>
            </div>
            <p className="text-red-300 text-xs mt-1">
              This will immediately alert dispatch and nearby responders. Only use for genuine emergencies.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedAction(null)}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEmergencyReport}
              disabled={!reportType || !reportDescription.trim() || isSubmitting}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/60 backdrop-blur-xl lg:rounded-xl lg:border lg:border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="w-full">
          <h3 className="text-white font-semibold">Quick Actions</h3>
          <p className="text-gray-400 text-sm">Emergency & communication tools</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Emergency Actions */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
            Emergency
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {emergencyActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Communication Actions */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
            Communication
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {communicationActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Status Actions */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            Status & Tasks
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {statusActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
