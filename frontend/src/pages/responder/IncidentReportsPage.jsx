import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Plus, Search, Filter, Download, Camera, Mic, MapPin, Clock, User, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const IncidentReportsPage = () => {
  const { sidebarOpen } = useSidebar();
  const { user } = useAuthStore();
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newReport, setNewReport] = useState({
    type: '',
    severity: '',
    location: '',
    description: '',
    photos: [],
    audioNotes: []
  });

  // Mock report statistics
  const reportStats = [
    { 
      label: "Total Reports", 
      value: "34", 
      color: "from-blue-500 to-blue-600",
      change: "+8",
      icon: FileText
    },
    { 
      label: "This Week", 
      value: "12", 
      color: "from-green-500 to-green-600",
      change: "+4",
      icon: Clock
    },
    { 
      label: "Pending Review", 
      value: "3", 
      color: "from-yellow-500 to-yellow-600",
      change: "-1",
      icon: AlertTriangle
    },
    { 
      label: "Approved", 
      value: "31", 
      color: "from-purple-500 to-purple-600",
      change: "+7",
      icon: User
    }
  ];

  // Mock incident reports
  const incidentReports = [
    {
      id: "RPT-2024-001",
      type: "Medical Emergency",
      severity: "High",
      location: "East Zone - Main Entrance",
      description: "Person collapsed near entrance, provided first aid until medical team arrived",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "approved",
      photos: 2,
      audioNotes: 1,
      responder: user?.name || "Current User"
    },
    {
      id: "RPT-2024-002",
      type: "Crowd Control",
      severity: "Medium",
      location: "South Zone - Stage Area",
      description: "Managed crowd surge during main event, redirected flow to alternate exits",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "pending",
      photos: 3,
      audioNotes: 0,
      responder: user?.name || "Current User"
    },
    {
      id: "RPT-2024-003",
      type: "Equipment Issue",
      severity: "Low",
      location: "West Zone - Security Post",
      description: "Radio communication intermittent, switched to backup equipment",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "approved",
      photos: 1,
      audioNotes: 1,
      responder: user?.name || "Current User"
    }
  ];

  const incidentTypes = [
    'Medical Emergency',
    'Fire Incident',
    'Security Threat',
    'Crowd Control',
    'Equipment Issue',
    'Environmental Hazard',
    'Other'
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-600';
      case 'pending': return 'text-yellow-400 bg-yellow-600';
      case 'rejected': return 'text-red-400 bg-red-600';
      case 'draft': return 'text-gray-400 bg-gray-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleNewReport = () => {
    setShowNewReportForm(true);
  };

  const handleSubmitReport = () => {
    console.log("Submitting report:", newReport);
    // In a real app, this would submit the report to the backend
    setShowNewReportForm(false);
    setNewReport({
      type: '',
      severity: '',
      location: '',
      description: '',
      photos: [],
      audioNotes: []
    });
  };

  const handleAddPhoto = () => {
    // In a real app, this would open camera or file picker
    console.log("Adding photo");
  };

  const handleAddAudioNote = () => {
    // In a real app, this would start audio recording
    console.log("Adding audio note");
  };

  const filteredReports = incidentReports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-2">
            Incident Reports
          </h1>
          <p className="text-gray-300">
            Create, manage, and track your incident reports and documentation
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleNewReport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>New Report</span>
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Download size={20} />
          </button>
        </div>
      </motion.div>

      {/* Report Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {reportStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 
                  stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
                <p className="text-gray-500 text-xs">this week</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Search & Filter Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Reports</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, type, or location..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Reports</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Your Incident Reports</h3>
          <p className="text-gray-400 text-sm">{filteredReports.length} reports found</p>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-medium">{report.id}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{report.description}</p>
                </div>
                
                <div className="text-right">
                  <span className={`text-sm font-medium ${getSeverityColor(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{report.type}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{report.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{report.timestamp.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Camera className="h-3 w-3" />
                    <span>{report.photos} photos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mic className="h-3 w-3" />
                    <span>{report.audioNotes} audio notes</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors duration-200">
                    View
                  </button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-xs transition-colors duration-200">
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* New Report Form Modal */}
      {showNewReportForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">New Incident Report</h3>
              <button
                onClick={() => setShowNewReportForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Incident Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select type...</option>
                    {incidentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                  <select
                    value={newReport.severity}
                    onChange={(e) => setNewReport({...newReport, severity: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select severity...</option>
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newReport.location}
                  onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                  placeholder="Enter incident location..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  placeholder="Describe the incident in detail..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddPhoto}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Camera size={16} />
                  <span>Add Photo</span>
                </button>
                
                <button
                  onClick={handleAddAudioNote}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Mic size={16} />
                  <span>Add Audio Note</span>
                </button>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowNewReportForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default IncidentReportsPage;
