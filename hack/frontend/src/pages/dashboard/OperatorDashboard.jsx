import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
	AlertTriangle,
	MapPin,
	MessageSquare,
	Clock,
	Activity,
	AlertCircle,
	Users,
	Camera,
	Zap,
	Shield,
	Eye,
	Brain
} from "lucide-react";

// Import dashboard components
import LiveVideoFeed from "../../components/monitoring/LiveVideoFeed";
import RealTimeAlerts from "../../components/monitoring/RealTimeAlerts";
import InteractiveZoneMap from "../../components/monitoring/InteractiveZoneMap";
import CommandCenter from "../../components/monitoring/CommandCenter";
import IncidentTimeline from "../../components/monitoring/IncidentTimeline";

const OperatorDashboard = () => {
	const { user } = useAuthStore();
	const { sidebarOpen } = useSidebar();
	const [loading, setLoading] = useState(false);
	const [selectedIncident, setSelectedIncident] = useState(null);
	const [timelineFilter, setTimelineFilter] = useState({
		startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
		endDate: new Date(),
		zone: null,
		type: null
	});

	// Mock real-time stats (in production, this would come from WebSocket)
	const [stats, setStats] = useState({
		activeIncidents: 3,
		totalZones: 4,
		activeResponders: 8,
		systemStatus: 'operational'
	});

	const statsCards = [
		{
			icon: AlertTriangle,
			label: "Active Incidents",
			value: stats.activeIncidents,
			color: "from-red-500 to-red-600",
			change: "+2 in last hour",
			pulse: stats.activeIncidents > 0
		},
		{
			icon: MapPin,
			label: "Monitored Zones",
			value: stats.totalZones,
			color: "from-blue-500 to-blue-600",
			change: "All operational"
		},
		{
			icon: Users,
			label: "Active Responders",
			value: stats.activeResponders,
			color: "from-green-500 to-green-600",
			change: "8/10 deployed"
		},
		{
			icon: Shield,
			label: "System Status",
			value: stats.systemStatus.toUpperCase(),
			color: "from-emerald-500 to-emerald-600",
			change: "All systems green",
			isText: true
		},
	];

	const handleIncidentSelect = (incident) => {
		setSelectedIncident(incident);
	};

	const handleTimelineFilter = (newFilter) => {
		setTimelineFilter(prev => ({ ...prev, ...newFilter }));
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
			</div>
		);
	}

	return (
		<div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'} min-h-screen`}>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-6"
			>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white mb-2 flex items-center">
							<Eye className="h-8 w-8 mr-3 text-cyan-400" />
							AI Event Monitor
						</h1>
						<p className="text-gray-300">
							Welcome back, {user?.name}! Command Center Operations
						</p>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
							<span className="text-green-400 text-sm font-medium">LIVE</span>
						</div>
						<div className="text-right">
							<div className="text-white font-semibold">{new Date().toLocaleTimeString()}</div>
							<div className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{statsCards.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						className={`bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50
							${stat.pulse ? 'ring-2 ring-red-500/50 animate-pulse' : ''}
							hover:border-cyan-500/50 transition-all duration-300`}
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
								<p className={`text-xl font-bold mt-1 ${stat.isText ? 'text-emerald-400' : 'text-white'}`}>
									{stat.value}
								</p>
								<p className="text-cyan-400 text-xs mt-1">{stat.change}</p>
							</div>
							<div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}>
								<stat.icon className="h-5 w-5 text-white" />
							</div>
						</div>
					</motion.div>
				))}
			</div>

			{/* Main Dashboard Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
				{/* Live Video Feed - Top Left */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
				>
					<LiveVideoFeed selectedIncident={selectedIncident} />
				</motion.div>

				{/* Real-Time Alerts - Top Right */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
				>
					<RealTimeAlerts onIncidentSelect={handleIncidentSelect} />
				</motion.div>

				{/* Interactive Zone Map - Bottom Left */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
				>
					<InteractiveZoneMap onIncidentSelect={handleIncidentSelect} selectedIncident={selectedIncident} />
				</motion.div>

				{/* Command Center - Bottom Right */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.7 }}
					className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
				>
					<CommandCenter />
				</motion.div>
			</div>

			{/* Incident Timeline - Bottom Full Width */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
			>
				<IncidentTimeline
					filter={timelineFilter}
					onFilterChange={handleTimelineFilter}
					onIncidentSelect={handleIncidentSelect}
				/>
			</motion.div>
		</div>
	);
};

export default OperatorDashboard;
