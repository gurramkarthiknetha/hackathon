import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { Users, Plus, Search, Filter, Edit, Trash2, Shield, UserCheck, UserX, Mail, Phone } from "lucide-react";

const UserManagementPage = () => {
  const { sidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // Mock user statistics
  const userStats = [
    { 
      label: "Total Users", 
      value: "156", 
      color: "from-blue-500 to-blue-600",
      change: "+12",
      icon: Users
    },
    { 
      label: "Active Users", 
      value: "142", 
      color: "from-green-500 to-green-600",
      change: "+8",
      icon: UserCheck
    },
    { 
      label: "Admins", 
      value: "8", 
      color: "from-purple-500 to-purple-600",
      change: "+1",
      icon: Shield
    },
    { 
      label: "Inactive", 
      value: "14", 
      color: "from-red-500 to-red-600",
      change: "-3",
      icon: UserX
    }
  ];

  // Mock users data
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@emergency.com",
      phone: "+1 (555) 123-4567",
      role: "admin",
      status: "active",
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      assignedZone: "all",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@emergency.com",
      phone: "+1 (555) 234-5678",
      role: "operator",
      status: "active",
      lastLogin: new Date(Date.now() - 30 * 60 * 1000),
      assignedZone: "central",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@emergency.com",
      phone: "+1 (555) 345-6789",
      role: "responder",
      status: "active",
      lastLogin: new Date(Date.now() - 15 * 60 * 1000),
      assignedZone: "east",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@emergency.com",
      phone: "+1 (555) 456-7890",
      role: "responder",
      status: "inactive",
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      assignedZone: "west",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@emergency.com",
      phone: "+1 (555) 567-8901",
      role: "operator",
      status: "active",
      lastLogin: new Date(Date.now() - 45 * 60 * 1000),
      assignedZone: "south",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
  };

  const handleDeleteUser = (userId) => {
    console.log("Delete user:", userId);
  };

  const handleToggleStatus = (userId) => {
    console.log("Toggle status for user:", userId);
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
        {userStats.map((stat, index) => (
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
          <p className="text-gray-400 text-sm">{filteredUsers.length} users found</p>
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
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{user.assignedZone}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 text-sm">
                      {user.lastLogin.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-2 rounded transition-colors duration-200 ${
                          user.status === 'active' 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
