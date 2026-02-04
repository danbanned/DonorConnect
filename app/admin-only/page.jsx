'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  KeyIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  LinkIcon,
  ServerIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import './AdminSettings.css';

export default function AdminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  
  // State for each section
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  
  // Form states
  const [inviteUserData, setInviteUserData] = useState({
    email: '',
    name: '',
    role: 'STAFF'
  });
  const [organizationData, setOrganizationData] = useState({
    name: '',
    timeZone: 'America/New_York',
    defaultSenderName: '',
    logo: ''
  });
  const [securityData, setSecurityData] = useState({
    require2FA: false,
    sessionTimeout: 24,
    minPasswordLength: 8,
    passwordExpiryDays: 90,
    lockoutAttempts: 5
  });
  
  // Fetch admin data
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      const userResponse = await fetch('/api/auth/login', {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const currentUser = userData.user || userData;
        
        if (currentUser.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch organization data
        console.log('USER:', user);
        console.log('ORG ID:', user?.organizationId);

        const orgResponse = await fetch(`/api/organization/${currentUser.organizationId}`, {
          credentials: 'include'
        });
        console.log(orgResponse,'sdfghjkl')
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganization(orgData);
          setOrganizationData({
            name: orgData.name || '',
            timeZone: orgData.timeZone || 'America/New_York',
            defaultSenderName: orgData.defaultSenderName || '',
            logo: orgData.logo || ''
          });
        }
        
        // Fetch users
        await fetchUsers();
        
        // Fetch audit logs
        await fetchAuditLogs();
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs?limit=50', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  // Tab Components
  const tabs = [
    { id: 'users', name: 'Users & Access', icon: UserGroupIcon },
    { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
    { id: 'donor-data', name: 'Donor Data', icon: ShieldCheckIcon },
    { id: 'financial', name: 'Financial', icon: ChartBarIcon },
    { id: 'reports', name: 'Reports & Exports', icon: DocumentTextIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'audit', name: 'Audit Logs', icon: ClockIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'danger', name: 'Danger Zone', icon: ExclamationTriangleIcon, danger: true }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin settings...</p>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-denied">
        <ShieldCheckIcon className="denied-icon" />
        <h2>Access Denied</h2>
        <p>You must be an administrator to access this page.</p>
        <button onClick={() => router.push('/dashboard')} className="primary-button">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Settings</h1>
          <p className="admin-subtitle">
            Manage your organization's settings, users, and security
          </p>
        </div>
        <div className="admin-stats">
          <div className="stat">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat">
            <div className="stat-value">{organization?.donorCount || 0}</div>
            <div className="stat-label">Donors</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {users.filter(u => u.status === 'ACTIVE').length}
            </div>
            <div className="stat-label">Active</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''} ${
              tab.danger ? 'danger' : ''
            }`}
          >
            <tab.icon className="tab-icon" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* Users & Access Management */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">User & Access Management</h2>
              <p className="section-description">
                Manage who can access your organization's data
              </p>
            </div>

            {/* Invite User Form */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Invite New User</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={inviteUserData.email}
                      onChange={(e) => setInviteUserData({
                        ...inviteUserData,
                        email: e.target.value
                      })}
                      placeholder="user@example.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={inviteUserData.name}
                      onChange={(e) => setInviteUserData({
                        ...inviteUserData,
                        name: e.target.value
                      })}
                      placeholder="John Smith"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={inviteUserData.role}
                      onChange={(e) => setInviteUserData({
                        ...inviteUserData,
                        role: e.target.value
                      })}
                      className="form-select"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="VIEWER">Viewer (Read-only)</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <button className="primary-button">
                  <PlusIcon className="button-icon" />
                  Send Invitation
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Active Users ({users.length})</h3>
                <div className="card-actions">
                  <button className="secondary-button small">
                    Export Users
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.name} className="user-avatar" />
                              ) : (
                                <div className="user-avatar-placeholder">
                                  {user.name?.charAt(0) || user.email.charAt(0)}
                                </div>
                              )}
                              <span>{user.name || 'No name'}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.status.toLowerCase()}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {user.lastLoginAt 
                              ? new Date(user.lastLoginAt).toLocaleDateString()
                              : 'Never'
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="icon-button"
                                title="Reset Password"
                                onClick={() => handleResetPassword(user.id)}
                              >
                                <KeyIcon />
                              </button>
                              <button
                                className="icon-button"
                                title="Edit User"
                                onClick={() => handleEditUser(user)}
                              >
                                <PencilIcon />
                              </button>
                              <button
                                className={`icon-button ${
                                  user.status === 'ACTIVE' ? 'danger' : ''
                                }`}
                                title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                onClick={() => toggleUserStatus(user.id, user.status)}
                              >
                                {user.status === 'ACTIVE' ? <XCircleIcon /> : <CheckCircleIcon />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Permission Presets */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Permission Presets</h3>
              </div>
              <div className="card-content">
                <div className="presets-grid">
                  <div className="preset-card">
                    <h4>Read-only</h4>
                    <ul>
                      <li>View donors</li>
                      <li>View communications</li>
                      <li>No edit permissions</li>
                    </ul>
                    <button className="secondary-button small">
                      Apply to Selected
                    </button>
                  </div>
                  <div className="preset-card">
                    <h4>Fundraising</h4>
                    <ul>
                      <li>Add/edit donors</li>
                      <li>View gifts</li>
                      <li>Send communications</li>
                    </ul>
                    <button className="secondary-button small">
                      Apply to Selected
                    </button>
                  </div>
                  <div className="preset-card">
                    <h4>Finance</h4>
                    <ul>
                      <li>View/edit all gifts</li>
                      <li>Financial reports</li>
                      <li>Export financial data</li>
                    </ul>
                    <button className="secondary-button small">
                      Apply to Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Settings */}
        {activeTab === 'organization' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Organization Settings</h2>
              <p className="section-description">
                Configure how your organization appears and operates
              </p>
            </div>

            {/* Organization Identity */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Organization Identity</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Organization Name *</label>
                    <input
                      type="text"
                      value={organizationData.name}
                      onChange={(e) => setOrganizationData({
                        ...organizationData,
                        name: e.target.value
                      })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Email Sender Name</label>
                    <input
                      type="text"
                      value={organizationData.defaultSenderName}
                      onChange={(e) => setOrganizationData({
                        ...organizationData,
                        defaultSenderName: e.target.value
                      })}
                      placeholder="Your Organization Name"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Zone</label>
                    <select
                      value={organizationData.timeZone}
                      onChange={(e) => setOrganizationData({
                        ...organizationData,
                        timeZone: e.target.value
                      })}
                      className="form-select"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Organization Logo</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                        className="file-input"
                      />
                      <button className="secondary-button">
                        <CloudArrowUpIcon className="button-icon" />
                        Upload Logo
                      </button>
                      {organizationData.logo && (
                        <div className="logo-preview">
                          <img src={organizationData.logo} alt="Logo" />
                          <button
                            onClick={() => setOrganizationData({
                              ...organizationData,
                              logo: ''
                            })}
                            className="text-button danger"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="primary-button">
                    Save Changes
                  </button>
                  <button className="secondary-button">
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Operational Defaults */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Operational Defaults</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Default Donor Naming</label>
                    <select className="form-select">
                      <option>Donor</option>
                      <option>Constituent</option>
                      <option>Supporter</option>
                      <option>Partner</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Required Fields for New Donors</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Email
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        Phone
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Address
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        Preferred Contact Method
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Default Email Template</label>
                    <select className="form-select">
                      <option>Standard Thank You</option>
                      <option>Annual Report</option>
                      <option>Newsletter</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color Theme</label>
                    <div className="color-picker">
                      <button className="color-option active" style={{ backgroundColor: '#3b82f6' }}></button>
                      <button className="color-option" style={{ backgroundColor: '#10b981' }}></button>
                      <button className="color-option" style={{ backgroundColor: '#8b5cf6' }}></button>
                      <button className="color-option" style={{ backgroundColor: '#ef4444' }}></button>
                      <button className="color-option" style={{ backgroundColor: '#f59e0b' }}></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donor Data Governance */}
        {activeTab === 'donor-data' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Donor Data Governance</h2>
              <p className="section-description">
                Manage donor data privacy and compliance
              </p>
            </div>

            {/* Data Control */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Data Control</h3>
              </div>
              <div className="card-content">
                <div className="data-control-grid">
                  <div className="control-card">
                    <h4>Merge Duplicate Donors</h4>
                    <p>Find and merge duplicate donor records</p>
                    <button className="secondary-button">
                      Find Duplicates
                    </button>
                  </div>
                  <div className="control-card">
                    <h4>Donor Privacy Settings</h4>
                    <p>Configure sensitive field visibility</p>
                    <button className="secondary-button">
                      Configure Privacy
                    </button>
                  </div>
                  <div className="control-card">
                    <h4>Data Retention</h4>
                    <p>Set automatic data retention rules</p>
                    <button className="secondary-button">
                      Set Rules
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Visibility */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Field Visibility & Permissions</h3>
              </div>
              <div className="card-content">
                <div className="field-visibility-table">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Admin</th>
                        <th>Staff</th>
                        <th>Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Gift Amounts</td>
                        <td>
                          <span className="permission-badge full">Full</span>
                        </td>
                        <td>
                          <span className="permission-badge limited">Limited</span>
                        </td>
                        <td>
                          <span className="permission-badge none">None</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Personal Notes</td>
                        <td>
                          <span className="permission-badge full">Full</span>
                        </td>
                        <td>
                          <span className="permission-badge limited">Own Only</span>
                        </td>
                        <td>
                          <span className="permission-badge none">None</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Contact Information</td>
                        <td>
                          <span className="permission-badge full">Full</span>
                        </td>
                        <td>
                          <span className="permission-badge full">Full</span>
                        </td>
                        <td>
                          <span className="permission-badge limited">View</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Compliance</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Consent Tracking</label>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                      <span>Track donor consent for communications</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Data Retention Period</label>
                    <select className="form-select">
                      <option>7 years (recommended)</option>
                      <option>5 years</option>
                      <option>3 years</option>
                      <option>Indefinitely</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Export Consent Logs</label>
                    <button className="secondary-button">
                      Download All Consent Records
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Controls */}
        {activeTab === 'financial' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Financial & Gift Controls</h2>
              <p className="section-description">
                Manage financial data access and operations
              </p>
            </div>

            {/* Access Control */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Financial Access Control</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Who can see gift amounts?</label>
                    <select className="form-select">
                      <option>Admins only</option>
                      <option>Admins and Finance staff</option>
                      <option>All staff</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Who can export financial data?</label>
                    <select className="form-select">
                      <option>Admins only</option>
                      <option>Admins and Finance staff</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lock Historical Gifts</label>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                      <span>Prevent editing of gifts older than 30 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Financial Operations</h3>
              </div>
              <div className="card-content">
                <div className="operations-grid">
                  <div className="operation-card">
                    <h4>Edit/Delete Gifts</h4>
                    <p>Modify existing donation records</p>
                    <button className="secondary-button">
                      Access Gift Editor
                    </button>
                  </div>
                  <div className="operation-card">
                    <h4>Manage Campaigns</h4>
                    <p>Create and manage fundraising campaigns</p>
                    <button className="secondary-button">
                      Campaign Manager
                    </button>
                  </div>
                  <div className="operation-card">
                    <h4>Reconcile Imports</h4>
                    <p>Review and approve imported financial data</p>
                    <button className="secondary-button">
                      Review Imports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports & Exports */}
        {activeTab === 'reports' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Reports & Exports</h2>
              <p className="section-description">
                Generate reports and export data
              </p>
            </div>

            {/* Quick Reports */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Reports</h3>
              </div>
              <div className="card-content">
                <div className="reports-grid">
                  <div className="report-card">
                    <h4>Full Donor Export</h4>
                    <p>Export all donor data as CSV</p>
                    <button className="secondary-button">
                      Export CSV
                    </button>
                  </div>
                  <div className="report-card">
                    <h4>Financial Summary</h4>
                    <p>Year-to-date financial report</p>
                    <button className="secondary-button">
                      Generate Report
                    </button>
                  </div>
                  <div className="report-card">
                    <h4>Staff Activity</h4>
                    <p>User activity and productivity report</p>
                    <button className="secondary-button">
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Exports */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Scheduled Exports</h3>
              </div>
              <div className="card-content">
                <div className="scheduled-exports">
                  <div className="export-item">
                    <div>
                      <h4>Monthly Donor Report</h4>
                      <p>Runs on 1st of every month</p>
                    </div>
                    <div className="export-actions">
                      <span className="status-badge active">Active</span>
                      <button className="text-button">Edit</button>
                    </div>
                  </div>
                  <div className="export-item">
                    <div>
                      <h4>Quarterly Financials</h4>
                      <p>Runs quarterly</p>
                    </div>
                    <div className="export-actions">
                      <span className="status-badge active">Active</span>
                      <button className="text-button">Edit</button>
                    </div>
                  </div>
                </div>
                <button className="secondary-button">
                  <PlusIcon className="button-icon" />
                  Add New Schedule
                </button>
              </div>
            </div>

            {/* API Keys */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">API Keys</h3>
              </div>
              <div className="card-content">
                <div className="api-keys">
                  <div className="api-key-item">
                    <div>
                      <h4>Reporting API Key</h4>
                      <code className="api-key">sk_live_***456def</code>
                    </div>
                    <div className="api-key-actions">
                      <button className="text-button">Regenerate</button>
                      <button className="text-button danger">Revoke</button>
                    </div>
                  </div>
                </div>
                <button className="primary-button">
                  <PlusIcon className="button-icon" />
                  Create New API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Security & Compliance</h2>
              <p className="section-description">
                Configure security settings and policies
              </p>
            </div>

            {/* Security Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Security Settings</h3>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Require Two-Factor Authentication</label>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={securityData.require2FA}
                          onChange={(e) => setSecurityData({
                            ...securityData,
                            require2FA: e.target.checked
                          })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span>All users must enable 2FA</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Session Timeout (hours)</label>
                    <input
                      type="number"
                      value={securityData.sessionTimeout}
                      onChange={(e) => setSecurityData({
                        ...securityData,
                        sessionTimeout: parseInt(e.target.value) || 24
                      })}
                      className="form-input"
                      min="1"
                      max="720"
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Password Length</label>
                    <input
                      type="number"
                      value={securityData.minPasswordLength}
                      onChange={(e) => setSecurityData({
                        ...securityData,
                        minPasswordLength: parseInt(e.target.value) || 8
                      })}
                      className="form-input"
                      min="8"
                      max="32"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Expiry (days)</label>
                    <input
                      type="number"
                      value={securityData.passwordExpiryDays}
                      onChange={(e) => setSecurityData({
                        ...securityData,
                        passwordExpiryDays: parseInt(e.target.value) || 90
                      })}
                      className="form-input"
                      min="30"
                      max="365"
                    />
                  </div>
                  <div className="form-group">
                    <label>Failed Attempts Before Lockout</label>
                    <input
                      type="number"
                      value={securityData.lockoutAttempts}
                      onChange={(e) => setSecurityData({
                        ...securityData,
                        lockoutAttempts: parseInt(e.target.value) || 5
                      })}
                      className="form-input"
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="primary-button">
                    Save Security Settings
                  </button>
                  <button className="secondary-button">
                    Enforce Password Reset for All Users
                  </button>
                </div>
              </div>
            </div>

            {/* IP Management */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">IP Access Management</h3>
              </div>
              <div className="card-content">
                <div className="ip-management">
                  <div className="form-group">
                    <label>Allowed IP Ranges</label>
                    <div className="ip-list">
                      <div className="ip-item">
                        <span>192.168.1.0/24</span>
                        <button className="text-button danger">Remove</button>
                      </div>
                      <div className="ip-item">
                        <span>10.0.0.0/16</span>
                        <button className="text-button danger">Remove</button>
                      </div>
                    </div>
                    <div className="add-ip-form">
                      <input
                        type="text"
                        placeholder="e.g., 192.168.1.0/24"
                        className="form-input"
                      />
                      <button className="secondary-button small">
                        Add IP Range
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Audit Logs & Accountability</h2>
              <p className="section-description">
                Monitor user activity and system changes
              </p>
            </div>

            {/* Audit Logs Table */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <div className="card-actions">
                  <button className="secondary-button small">
                    Export Logs
                  </button>
                  <button className="secondary-button small">
                    <MagnifyingGlassIcon className="button-icon" />
                    Filter
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>IP Address</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.createdAt).toLocaleString()}</td>
                          <td>
                            <div className="user-cell">
                              {log.user?.name || 'System'}
                            </div>
                          </td>
                          <td>
                            <span className={`action-badge ${log.action.toLowerCase()}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>{log.entityType || 'System'}</td>
                          <td>{log.ipAddress || 'N/A'}</td>
                          <td>
                            {log.details ? (
                              <button
                                className="text-button"
                                onClick={() => showLogDetails(log)}
                              >
                                View Details
                              </button>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Audit Statistics */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Audit Statistics</h3>
              </div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">
                      {auditLogs.filter(l => l.action.includes('LOGIN')).length}
                    </div>
                    <div className="stat-label">Logins Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {auditLogs.filter(l => l.action.includes('EDIT')).length}
                    </div>
                    <div className="stat-label">Edits Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {auditLogs.filter(l => l.action.includes('EXPORT')).length}
                    </div>
                    <div className="stat-label">Exports Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {auditLogs.filter(l => l.action.includes('FAILED')).length}
                    </div>
                    <div className="stat-label">Failed Actions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Integrations & System Features</h2>
              <p className="section-description">
                Connect external services and configure system features
              </p>
            </div>

            {/* Payment Processors */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Payment Processors</h3>
              </div>
              <div className="card-content">
                <div className="integrations-grid">
                  <div className="integration-card">
                    <div className="integration-header">
                      <h4>Stripe</h4>
                      <span className="status-badge active">Connected</span>
                    </div>
                    <p>Credit card processing</p>
                    <div className="integration-actions">
                      <button className="secondary-button small">
                        Configure
                      </button>
                      <button className="text-button danger small">
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <div className="integration-card">
                    <div className="integration-header">
                      <h4>PayPal</h4>
                      <span className="status-badge inactive">Not Connected</span>
                    </div>
                    <p>Alternative payment processing</p>
                    <button className="secondary-button small">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Services */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Email Services</h3>
              </div>
              <div className="card-content">
                <div className="integrations-grid">
                  <div className="integration-card">
                    <div className="integration-header">
                      <h4>SendGrid</h4>
                      <span className="status-badge active">Connected</span>
                    </div>
                    <p>Transaction and marketing emails</p>
                    <div className="integration-actions">
                      <button className="secondary-button small">
                        Configure
                      </button>
                      <button className="text-button small">
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhooks */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Webhooks</h3>
              </div>
              <div className="card-content">
                <div className="webhooks-list">
                  <div className="webhook-item">
                    <div>
                      <h4>Donation Webhook</h4>
                      <code className="webhook-url">
                        https://api.example.com/webhooks/donations
                      </code>
                    </div>
                    <div className="webhook-actions">
                      <span className="status-badge active">Active</span>
                      <button className="text-button">Edit</button>
                    </div>
                  </div>
                </div>
                <button className="primary-button">
                  <PlusIcon className="button-icon" />
                  Add Webhook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title danger">Danger Zone</h2>
              <p className="section-description">
                Irreversible actions. Proceed with extreme caution.
              </p>
            </div>

            <div className="danger-zone">
              {/* Transfer Ownership */}
              <div className="danger-card">
                <div className="danger-header">
                  <h3>Transfer Organization Ownership</h3>
                  <ExclamationTriangleIcon className="danger-icon" />
                </div>
                <p>
                  Transfer complete administrative control to another user.
                  You will become a regular staff member.
                </p>
                <div className="danger-form">
                  <select className="form-select">
                    <option>Select a user...</option>
                    {users
                      .filter(u => u.id !== user.id && u.status === 'ACTIVE')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))
                    }
                  </select>
                  <button className="danger-button">
                    Transfer Ownership
                  </button>
                </div>
              </div>

              {/* Delete Organization */}
              <div className="danger-card">
                <div className="danger-header">
                  <h3>Delete Organization</h3>
                  <TrashIcon className="danger-icon" />
                </div>
                <p>
                  Permanently delete this organization and all associated data.
                  This action cannot be undone.
                </p>
                <div className="danger-actions">
                  <input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    className="form-input"
                  />
                  <button className="danger-button">
                    <TrashIcon className="button-icon" />
                    Delete Organization
                  </button>
                </div>
              </div>

              {/* Wipe Data */}
              <div className="danger-card">
                <div className="danger-header">
                  <h3>Wipe All Data</h3>
                  <ExclamationTriangleIcon className="danger-icon" />
                </div>
                <p>
                  Remove all donor, donation, and communication data while
                  keeping the organization structure.
                </p>
                <div className="danger-actions">
                  <button className="danger-button">
                    <ArrowPathIcon className="button-icon" />
                    Wipe All Data
                  </button>
                </div>
              </div>

              {/* Cancel Plan */}
              <div className="danger-card">
                <div className="danger-header">
                  <h3>Cancel Plan / Downgrade</h3>
                  <ExclamationTriangleIcon className="danger-icon" />
                </div>
                <p>
                  Cancel your subscription or downgrade to a free plan.
                  Some features may become unavailable.
                </p>
                <div className="danger-actions">
                  <button className="danger-button">
                    Manage Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder functions - implement these based on your API
const handleResetPassword = async (userId) => {
  if (confirm('Reset this user\'s password? They will receive an email with reset instructions.')) {
    // Call API to reset password
    console.log('Reset password for:', userId);
  }
};

const handleEditUser = (user) => {
  // Open edit user modal
  console.log('Edit user:', user);
};

const toggleUserStatus = async (userId, currentStatus) => {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
  
  if (confirm(`Are you sure you want to ${action} this user?`)) {
    // Call API to update user status
    console.log(`${action} user:`, userId);
  }
};

const handleLogoUpload = async (file) => {
  // Upload logo file
  console.log('Upload logo:', file);
};

const showLogDetails = (log) => {
  // Show log details modal
  console.log('Log details:', log);
};