import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { Calendar, Clock, Activity, TrendingUp, Users } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

const HomePage = () => {
  const { user } = useAuthStore();
  const { sidebarOpen } = useSidebar();

  const stats = [
    { icon: Users, label: "Team Members", value: "12", color: "from-blue-500 to-blue-600" },
    { icon: Activity, label: "Active Projects", value: "8", color: "from-green-500 to-green-600" },
    { icon: TrendingUp, label: "Completed Tasks", value: "24", color: "from-purple-500 to-purple-600" },
    { icon: Clock, label: "Hours Logged", value: "156", color: "from-orange-500 to-orange-600" },
  ];

  const recentActivities = [
    { action: "Project Alpha updated", time: "2 hours ago", type: "update" },
    { action: "New team member joined", time: "4 hours ago", type: "user" },
    { action: "Task completed: UI Design", time: "6 hours ago", type: "task" },
    { action: "Meeting scheduled for tomorrow", time: "1 day ago", type: "meeting" },
  ];

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-300">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 bg-opacity-50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
              <div className="font-medium">Create New Project</div>
              <div className="text-sm opacity-90">Start a new hackathon project</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all duration-200 border border-gray-700">
              <div className="font-medium">Schedule Meeting</div>
              <div className="text-sm text-gray-400">Plan your next team sync</div>
            </button>
            <button className="w-full p-3 text-left bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all duration-200 border border-gray-700">
              <div className="font-medium">View Reports</div>
              <div className="text-sm text-gray-400">Check project analytics</div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
