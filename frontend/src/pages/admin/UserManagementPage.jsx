import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, Edit, Trash2, Shield, UserCheck, UserX, Mail, Phone } from "lucide-react";
import userService from "../../services/userService";
import { ensureAuthentication } from "../../utils/auth";

const UserManagementPage = () => {
  const { sidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  // Load users and stats on component mount
  useEffect(() => {
    ensureAuthentication(); // Set auth token for testing
    loadUsers();
    loadUserStats();
  }, []);

  // Reload users when filters change
  useEffect(() => {
    loadUsers();
  }, [searchTerm, filterRole, filterStatus, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        role: filterRole,
        search: searchTerm || undefined,
        isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.users || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await userService.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  // Transform stats for display
  const getDisplayStats = () => {
    if (!userStats) {
      return [
        { label: "Total Users", value: "0", color: "from-blue-500 to-blue-600", change: "", icon: Users },
        { label: "Active Users", value: "0", color: "from-green-500 to-green-600", change: "", icon: UserCheck },
        { label: "Admins", value: "0", color: "from-purple-500 to-purple-600", change: "", icon: Shield },
        { label: "Inactive", value: "0", color: "from-red-500 to-red-600", change: "", icon: UserX }
      ];
    }

    const inactiveUsers = userStats.totalUsers - userStats.activeUsers;
    return [
      { 
        label: "Total Users", 
        value: userStats.totalUsers.toString(), 
        color: "from-blue-500 to-blue-600",
        change: "",
        icon: Users
      },
      { 
        label: "Active Users", 
        value: userStats.activeUsers.toString(), 
        color: "from-green-500 to-green-600",
        change: "",
        icon: UserCheck
      },
      { 
        label: "Admins", 
        value: (userStats.usersByRole?.admin || 0).toString(), 
        color: "from-purple-500 to-purple-600",
        change: "",
        icon: Shield
      },
      { 
        label: "Inactive", 
        value: inactiveUsers.toString(), 
        color: "from-red-500 to-red-600",
        change: "",
        icon: UserX
      }
    ];
  };


  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'operator', label: 'Operator' },
    { value: 'responder', label: 'Responder' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const zones = [
    'all', 'central', 'east', 'west', 'north', 'south'
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-600';
      case 'operator': return 'text-blue-400 bg-blue-600';
      case 'responder': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-600';
      case 'inactive': return 'text-gray-400 bg-gray-600';
      case 'suspended': return 'text-red-400 bg-red-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  // Users are already filtered by the API, so we use them directly
  const filteredUsers = users;

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    // TODO: Implement edit user modal
  };

  const handleDeleteUser = async (userId) => {
    console.log('Attempting to delete user with ID:', userId);
    
    // Force refresh auth token
    ensureAuthentication();
    console.log('Current auth token:', localStorage.getItem('auth_token'));
    
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        console.log('Calling userService.deleteUser...');
        const result = await userService.deleteUser(userId);
        console.log('Delete result:', result);
        loadUsers(); // Reload users after deletion
        loadUserStats(); // Reload stats
        alert('User deleted successfully!');
      } catch (err) {
        console.error('Failed to delete user - Full error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        alert(`Failed to delete user: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;
    
    try {
      await userService.updateUser(userId, { isActive: !user.isActive });
      loadUsers(); // Reload users after status change
      loadUserStats(); // Reload stats
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      alert('Failed to update user status. Please try again.');
    }
  };

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mb-2">
            User Management
          </h1>
          <p className="text-gray-300">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddUserForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        </div>
      </motion.div>

      {/* User Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {getDisplayStats().map((stat, index) => (
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
                <p className="text-gray-500 text-xs">this month</p>
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
          <h3 className="text-lg font-semibold text-white">Search & Filter Users</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">System Users</h3>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading...' : `${pagination.total} users found`}
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">User</th>
                <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Zone</th>
                <th className="text-left p-4 text-gray-300 font-medium">Last Login</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    {error ? 'Failed to load users' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{user.name}</h4>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{user.assignedZone || 'Not assigned'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded transition-colors duration-200 ${
                            user.isActive 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Mail className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Send Notification</span>
          </button>
          
          <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Bulk Actions</span>
          </button>
          
          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Role Management</span>
          </button>
          
          <button className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Phone className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Emergency Contact</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserManagementPage;
