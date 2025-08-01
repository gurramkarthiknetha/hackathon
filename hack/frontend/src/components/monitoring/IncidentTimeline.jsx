import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Filter, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Flame,
  Users,
  Heart,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const IncidentTimeline = ({ filter, onFilterChange, onIncidentSelect }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  // Mock timeline data
  const mockIncidents = [
    {
      id: 1,
      type: "fire",
      zone: "north_zone",
      severity: "critical",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "resolved",
      duration: 25,
      description: "Equipment fire in backstage area"
    },
    {
      id: 2,
      type: "crowd_surge", 
      zone: "east_zone",
      severity: "high",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: "in_progress",
      duration: null,
      description: "High crowd density near main stage"
    },
    {
      id: 3,
      type: "medical_emergency",
      zone: "west_zone", 
      severity: "medium",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "resolved",
      duration: 12,
      description: "Medical assistance provided"
    },
    {
      id: 4,
      type: "security_threat",
      zone: "south_zone",
      severity: "high", 
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "resolved",
      duration: 18,
      description: "Suspicious activity investigated"
    },
    {
      id: 5,
      type: "equipment_failure",
      zone: "east_zone",
      severity: "low",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: "resolved", 
      duration: 5,
      description: "Sound system malfunction"
    },
    {
      id: 6,
      type: "unconscious_person",
      zone: "west_zone",
      severity: "medium",
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      status: "resolved",
      duration: 15,
      description: "Person requiring medical attention"
    },
    {
      id: 7,
      type: "crowd_surge",
      zone: "north_zone", 
      severity: "medium",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: "resolved",
      duration: 8,
      description: "Crowd management intervention"
    },
    {
      id: 8,
      type: "medical_emergency",
      zone: "south_zone",
      severity: "high",
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
      status: "resolved",
      duration: 22,
      description: "Emergency medical response"
    },
    {
      id: 9,
      type: "fire",
      zone: "west_zone",
      severity: "medium",
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      status: "resolved",
      duration: 30,
      description: "Small fire in vendor area"
    },
    {
      id: 10,
      type: "equipment_failure",
      zone: "north_zone",
      severity: "low",
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      status: "resolved",
      duration: 3,
      description: "Lighting system issue"
    }
  ];

  useEffect(() => {
    // Filter incidents based on time range
    const now = Date.now();
    const timeRanges = {
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeRanges[selectedTimeRange];
    const filtered = mockIncidents.filter(incident => 
      incident.timestamp.getTime() >= cutoff
    );

    setTimelineData(filtered);
    setCurrentPage(0);
  }, [selectedTimeRange]);

  const getIncidentIcon = (type) => {
    switch (type) {
      case "fire": return Flame;
      case "crowd_surge": return Users;
      case "medical_emergency": return Heart;
      case "unconscious_person": return Heart;
      case "security_threat": return Shield;
      case "equipment_failure": return Zap;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500 border-red-400 text-red-100";
      case "high": return "bg-orange-500 border-orange-400 text-orange-100";
      case "medium": return "bg-yellow-500 border-yellow-400 text-yellow-100";
      case "low": return "bg-green-500 border-green-400 text-green-100";
      default: return "bg-gray-500 border-gray-400 text-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-red-400";
      case "assigned": return "text-yellow-400";
      case "in_progress": return "text-blue-400";
      case "resolved": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Ongoing";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const paginatedData = timelineData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(timelineData.length / itemsPerPage);

  const handleIncidentClick = (incident) => {
    onIncidentSelect && onIncidentSelect(incident);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Incident Timeline</h3>
              <p className="text-gray-400 text-sm">{timelineData.length} incidents in {selectedTimeRange}</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-red-400 font-semibold">
              {timelineData.filter(i => i.severity === "critical").length}
            </div>
            <div className="text-gray-400 text-xs">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-semibold">
              {timelineData.filter(i => i.severity === "high").length}
            </div>
            <div className="text-gray-400 text-xs">High</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {timelineData.filter(i => i.status === "resolved").length}
            </div>
            <div className="text-gray-400 text-xs">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">
              {timelineData.filter(i => i.status !== "resolved").length}
            </div>
            <div className="text-gray-400 text-xs">Active</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-3">
            {paginatedData.map((incident, index) => {
              const IconComponent = getIncidentIcon(incident.type);
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-colors"
                  onClick={() => handleIncidentClick(incident)}
                >
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getSeverityColor(incident.severity)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {index < paginatedData.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-600 mt-2"></div>
                    )}
                  </div>

                  {/* Incident Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium text-sm">
                        {incident.type.replace('_', ' ').toUpperCase()}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={getStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-gray-400">
                          {formatTime(incident.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">
                      {incident.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{incident.zone.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {formatDuration(incident.duration)}</span>
                      </div>
                      {incident.status === "resolved" && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, timelineData.length)} of {timelineData.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-300">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
