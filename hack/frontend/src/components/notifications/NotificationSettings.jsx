import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Bell,
  Settings,
  Save,
  RefreshCw,
  TestTube,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  Zap,
  Filter
} from "lucide-react";
import { toast } from "react-hot-toast";
import useNotificationStore from "../../store/notificationStore";

const NotificationSettings = () => {
  const { emailSettings, updateEmailSettings } = useNotificationStore();
  const [settings, setSettings] = useState(emailSettings);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    setSettings(emailSettings);
  }, [emailSettings]);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleRoleToggle = (category, role) => {
    setSettings(prev => {
      const currentRoles = prev[category].notifyRoles || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          notifyRoles: newRoles
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      updateEmailSettings(settings);
      toast.success("Email notification settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would make an API call to send test email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success(`Test email sent to ${testEmail}!`);
      setTestEmail("");
    } catch (error) {
      toast.error("Failed to send test email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultSettings = {
      emailNotificationsEnabled: true,
      incidentCreated: {
        enabled: true,
        notifyRoles: ["admin", "operator"],
        notifyZoneResponders: true,
      },
      incidentAssigned: {
        enabled: true,
        notifyRoles: ["admin", "operator"],
        notifyAssignedResponder: true,
      },
      incidentStatusUpdate: {
        enabled: true,
        notifyRoles: ["admin", "operator"],
        notifyOnResolved: true,
        notifyOnInProgress: true,
      },
      incidentApproval: {
        enabled: true,
        notifyRoles: ["admin", "operator"],
        notifyOnApproved: true,
        notifyOnDismissed: true,
      },
      severityFilters: {
        notifyOnLow: true,
        notifyOnMedium: true,
        notifyOnHigh: true,
        notifyOnCritical: true,
      },
    };
    setSettings(defaultSettings);
    toast.success("Settings reset to defaults");
  };

  const renderNotificationSection = (title, category, icon: Icon, options = {}) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>

      <div className="space-y-4">
        {/* Enable/Disable */}
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings[category]?.enabled || false}
            onChange={(e) => handleSettingChange(category, 'enabled', e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Enable {title.toLowerCase()}</span>
        </label>

        {settings[category]?.enabled && (
          <>
            {/* Role Selection */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Notify these roles:</p>
              <div className="flex space-x-3">
                {["admin", "operator", "responder"].map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[category]?.notifyRoles?.includes(role) || false}
                      onChange={() => handleRoleToggle(category, role)}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300 text-sm capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            {options.showZoneResponders && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings[category]?.notifyZoneResponders || false}
                  onChange={(e) => handleSettingChange(category, 'notifyZoneResponders', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">Notify zone responders</span>
              </label>
            )}

            {options.showAssignedResponder && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings[category]?.notifyAssignedResponder || false}
                  onChange={(e) => handleSettingChange(category, 'notifyAssignedResponder', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">Notify assigned responder</span>
              </label>
            )}

            {options.showStatusOptions && (
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings[category]?.notifyOnResolved || false}
                    onChange={(e) => handleSettingChange(category, 'notifyOnResolved', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Notify when resolved</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings[category]?.notifyOnInProgress || false}
                    onChange={(e) => handleSettingChange(category, 'notifyOnInProgress', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Notify when in progress</span>
                </label>
              </div>
            )}

            {options.showApprovalOptions && (
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings[category]?.notifyOnApproved || false}
                    onChange={(e) => handleSettingChange(category, 'notifyOnApproved', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Notify when approved</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings[category]?.notifyOnDismissed || false}
                    onChange={(e) => handleSettingChange(category, 'notifyOnDismissed', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Notify when dismissed</span>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Mail className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Email Notification Settings</h2>
            <p className="text-gray-400">Configure when and who receives email notifications</p>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Global Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.emailNotificationsEnabled}
              onChange={(e) => setSettings(prev => ({ ...prev, emailNotificationsEnabled: e.target.checked }))}
              className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable email notifications globally</span>
          </label>
        </div>
      </div>

      {/* Notification Types */}
      {settings.emailNotificationsEnabled && (
        <div className="space-y-6">
          {renderNotificationSection("Incident Created", "incidentCreated", Bell, { showZoneResponders: true })}
          {renderNotificationSection("Incident Assigned", "incidentAssigned", Users, { showAssignedResponder: true })}
          {renderNotificationSection("Status Updates", "incidentStatusUpdate", Zap, { showStatusOptions: true })}
          {renderNotificationSection("Incident Approval", "incidentApproval", Shield, { showApprovalOptions: true })}

          {/* Severity Filters */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold">Severity Filters</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Low", "Medium", "High", "Critical"].map(severity => (
                <label key={severity} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.severityFilters?.[`notifyOn${severity}`] || false}
                    onChange={(e) => handleSettingChange('severityFilters', `notifyOn${severity}`, e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{severity} severity incidents</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Email */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Test Email Configuration</h3>
        <div className="flex space-x-3">
          <input
            type="email"
            placeholder="Enter email address to test"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Send Test</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset to Defaults</span>
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
