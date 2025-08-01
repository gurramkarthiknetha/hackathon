import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
	AlertTriangle,
	Clock,
	CheckCircle,
	MapPin,
	Activity,
	Zap,
	Phone,
	Navigation,
	User,
	Shield,
	Radio,
	Camera,
	Map,
	MessageSquare,
	Battery,
	Signal,
	Target,
	ArrowRight,
	Play,
	Pause,
	RotateCcw,
	Wifi,
	WifiOff
} from "lucide-react";

// Import mobile components
import ResponderMap from "../../components/monitoring/ResponderMap";
import AssignedTasks from "../../components/monitoring/AssignedTasks";
import QuickActions from "../../components/monitoring/QuickActions";
import { useSocket } from "../../hooks/useSocket";

const ResponderDashboard = () => {
	const { user } = useAuthStore();
	const { sidebarOpen } = useSidebar();
	const { isConnected, updateLocation, updateStatus, incidents } = useSocket();
	const [loading, setLoading] = useState(false);
	const [activeView, setActiveView] = useState("tasks"); // tasks, map, actions
	const [responderStatus, setResponderStatus] = useState("available");
	const [currentLocation, setCurrentLocation] = useState(null);
	const [batteryLevel, setBatteryLevel] = useState(85);
	const [signalStrength, setSignalStrength] = useState(4);

	// Responder data with real-time incidents
	const [responderData, setResponderData] = useState({
		assignedZone: user?.assignedZone || "east_zone",
		activeIncidents: 0,
		completedToday: 5,
		responseTime: "4.2 min",
		status: "available"
	});

	// Update active incidents count from real-time data
	useEffect(() => {
		const activeCount = incidents.filter(incident =>
			incident.status === "active" || incident.status === "assigned"
		).length;
		setResponderData(prev => ({ ...prev, activeIncidents: activeCount }));
	}, [incidents]);

	// Get location on mount and update via WebSocket
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					};
					setCurrentLocation(location);
					// Send location update via WebSocket
					updateLocation(location);
				},
				(error) => {
					console.log("Location access denied");
					// Use mock location for demo
					const mockLocation = {
						latitude: 40.7132,
						longitude: -74.0055
					};
					setCurrentLocation(mockLocation);
					updateLocation(mockLocation);
				}
			);

			// Set up location tracking
			const watchId = navigator.geolocation.watchPosition(
				(position) => {
					const location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					};
					setCurrentLocation(location);
					updateLocation(location);
				},
				(error) => console.log("Location tracking error:", error),
				{ enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
			);

			return () => navigator.geolocation.clearWatch(watchId);
		}
	}, [updateLocation]);

	const getStatusColor = (status) => {
		switch (status) {
			case 'available': return 'text-green-400 bg-green-900/20';
			case 'responding': return 'text-blue-400 bg-blue-900/20';
			case 'busy': return 'text-yellow-400 bg-yellow-900/20';
			case 'offline': return 'text-gray-400 bg-gray-900/20';
			default: return 'text-gray-400 bg-gray-900/20';
		}
	};

	const handleStatusChange = (newStatus) => {
		setResponderStatus(newStatus);
		setResponderData(prev => ({ ...prev, status: newStatus }));
		// Send status update via WebSocket
		updateStatus(newStatus);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 lg:p-4">
			{/* Mobile Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700/50 p-4 lg:rounded-t-xl"
			>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
							<Shield className="h-6 w-6 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-white">Responder</h1>
							<p className="text-gray-400 text-sm">{user?.name}</p>
						</div>
					</div>

					{/* Status & Indicators */}
					<div className="flex items-center space-x-3">
						<div className="flex items-center space-x-1">
							{isConnected ? (
								<Wifi className="h-4 w-4 text-green-400" />
							) : (
								<WifiOff className="h-4 w-4 text-red-400" />
							)}
							<span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
								{isConnected ? 'ONLINE' : 'OFFLINE'}
							</span>
						</div>
						<div className="flex items-center space-x-1">
							<Battery className={`h-4 w-4 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
							<span className="text-xs text-gray-400">{batteryLevel}%</span>
						</div>
						<div className="flex items-center space-x-1">
							<Signal className="h-4 w-4 text-green-400" />
							<div className="flex space-x-0.5">
								{[...Array(4)].map((_, i) => (
									<div
										key={i}
										className={`w-1 h-3 rounded-full ${
											i < signalStrength ? 'bg-green-400' : 'bg-gray-600'
										}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Status Selector */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<span className="text-gray-400 text-sm">Status:</span>
						<select
							value={responderStatus}
							onChange={(e) => handleStatusChange(e.target.value)}
							className={`bg-gray-700 text-white text-sm rounded-lg px-3 py-1 border border-gray-600 focus:border-cyan-500 focus:outline-none ${getStatusColor(responderStatus)}`}
						>
							<option value="available">Available</option>
							<option value="responding">Responding</option>
							<option value="busy">Busy</option>
							<option value="offline">Offline</option>
						</select>
					</div>

					<div className="text-right">
						<div className="text-white font-semibold text-sm">{new Date().toLocaleTimeString()}</div>
						<div className="text-gray-400 text-xs">{responderData.assignedZone.replace('_', ' ').toUpperCase()}</div>
					</div>
				</div>
			</motion.div>

			{/* Quick Stats */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700/50 p-4 lg:rounded-none"
			>
				<div className="grid grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-red-400 font-bold text-lg">{responderData.activeIncidents}</div>
						<div className="text-gray-400 text-xs">Active</div>
					</div>
					<div className="text-center">
						<div className="text-green-400 font-bold text-lg">{responderData.completedToday}</div>
						<div className="text-gray-400 text-xs">Completed</div>
					</div>
					<div className="text-center">
						<div className="text-blue-400 font-bold text-lg">{responderData.responseTime}</div>
						<div className="text-gray-400 text-xs">Avg Time</div>
					</div>
					<div className="text-center">
						<div className={`font-bold text-lg ${getStatusColor(responderData.status).split(' ')[0]}`}>
							{responderData.status.toUpperCase()}
						</div>
						<div className="text-gray-400 text-xs">Status</div>
					</div>
				</div>
			</motion.div>

			{/* Mobile Navigation */}
			<div className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700/50 p-2 lg:hidden">
				<div className="flex space-x-1">
					{[
						{ id: "tasks", label: "Tasks", icon: Target },
						{ id: "map", label: "Map", icon: Map },
						{ id: "actions", label: "Actions", icon: Zap }
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveView(tab.id)}
							className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
								activeView === tab.id
									? 'bg-cyan-600 text-white'
									: 'text-gray-400 hover:text-white hover:bg-gray-700'
							}`}
						>
							<tab.icon className="h-4 w-4" />
							<span className="text-sm font-medium">{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 lg:bg-gray-800/60 lg:backdrop-blur-xl lg:border lg:border-gray-700/50 lg:rounded-b-xl">
				{/* Desktop Layout */}
				<div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:p-6">
					<div>
						<AssignedTasks currentLocation={currentLocation} />
					</div>
					<div className="space-y-6">
						<ResponderMap currentLocation={currentLocation} />
						<QuickActions />
					</div>
				</div>

				{/* Mobile Layout */}
				<div className="lg:hidden">
					{activeView === "tasks" && (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<AssignedTasks currentLocation={currentLocation} />
						</motion.div>
					)}

					{activeView === "map" && (
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<ResponderMap currentLocation={currentLocation} />
						</motion.div>
					)}

					{activeView === "actions" && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<QuickActions />
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ResponderDashboard;
