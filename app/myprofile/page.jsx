'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  KeyIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import './MyProfile.css';

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentAdminActions, setRecentAdminActions] = useState([]);

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch('/api/auth/login', {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user || userData);
        setFormData({
          name: userData.user?.name || userData.name,
          email: userData.user?.email || userData.email,
          timeZone: userData.user?.timeZone || 'America/New_York',
          language: userData.user?.language || 'en',
          defaultDashboardView: userData.user?.defaultDashboardView || 'overview',
          emailFrequency: userData.user?.emailFrequency || 'INSTANT',
          phone: userData.user?.phone || '',
          notificationPreferences: userData.user?.notificationPreferences || {
            donorUpdates: true,
            taskReminders: true,
            systemAlerts: true,
            emailNotifications: true,
            pushNotifications: false
          }
        });
        
        // If user has organization data, fetch full org details
        if (userData.user?.organization || userData.organization) {
          const org = userData.user?.organization || userData.organization;
          setOrganization(org);
          
          // Fetch additional org stats if admin
          if ((userData.user?.role || userData.role) === 'ADMIN') {
            fetchOrganizationStats(org.id);
            fetchRecentAdminActions(org.id);
          }
        }
        
        // Fetch active sessions
        fetchActiveSessions();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationStats = async (orgId) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const stats = await response.json();
        setOrganization(prev => ({ ...prev, ...stats }));
      }
    } catch (error) {
      console.error('Failed to fetch org stats:', error);
    }
  };

  const fetchRecentAdminActions = async (orgId) => {
    try {
      const response = await fetch(`/api/audit?organizationId=${orgId}&limit=5`, {
        credentials: 'include'
      });
      if (response.ok) {
        const actions = await response.json();
        setRecentAdminActions(actions);
      }
    } catch (error) {
      console.error('Failed to fetch admin actions:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        credentials: 'include'
      });
      if (response.ok) {
        const sessions = await response.json();
        setActiveSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleEditField = (field) => {
    setEditing(field);
  };

  const handleSaveField = async () => {
    if (!editing) return;
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          [editing]: formData[editing]
        })
      });
      
      if (response.ok) {
        setUser(prev => ({ ...prev, [editing]: formData[editing] }));
        setMessage({
          type: 'success',
          text: 'Profile updated successfully'
        });
        setEditing(null);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
    }
  };

  const handleNotificationToggle = async (preference) => {
    const newPreferences = {
      ...formData.notificationPreferences,
      [preference]: !formData.notificationPreferences[preference]
    };
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationPreferences: newPreferences
        })
      });
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          notificationPreferences: newPreferences
        }));
        setUser(prev => ({
          ...prev,
          notificationPreferences: newPreferences
        }));
      }
    } catch (error) {
      console.error('Failed to update notification preference:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully'
        });
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to log out of all devices? This will end all active sessions.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/auth/logout-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Logged out of all devices'
        });
        setActiveSessions([]);
        
        // Refresh page to get new session
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to log out all devices'
      });
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    setPasswordStrength(Math.min(strength, 100));
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <ExclamationCircleIcon className="error-icon" />
        <h2>Unable to load profile</h2>
        <p>Please try again or contact support if the problem persists.</p>
        <button onClick={fetchUserData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';
  const isStaff = user.role === 'STAFF' || user.role === 'VIEWER';

  return (
    <div className="my-profile">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">
          Who you are in this system, what you can do, and how you're connected
        </p>
      </div>

      {message && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="message-icon" />
          ) : (
            <ExclamationCircleIcon className="message-icon" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Column: Identity & Security */}
        <div className="profile-column">
          {/* Identity Card */}
          <div className="profile-card">
            <div className="card-header">
              <UserCircleIcon className="card-icon" />
              <h2 className="card-title">Identity & Contact</h2>
            </div>
            
            <div className="card-content">
              {/* Profile Photo */}
              <div className="profile-photo-section">
                <div className="profile-photo-placeholder">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="profile-photo" />
                  ) : (
                    <UserCircleIcon className="photo-icon" />
                  )}
                </div>
                <button className="photo-upload-button">
                  Upload photo
                </button>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  <UserCircleIcon className="label-icon" />
                  Full name
                </label>
                {editing === 'name' ? (
                  <div className="edit-field">
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveField} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display" onClick={() => handleEditField('name')}>
                    <span className="field-value">{user.name || 'Not set'}</span>
                    <button className="edit-button">Edit</button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  <EnvelopeIcon className="label-icon" />
                  Email (login identifier)
                </label>
                <div className="field-display">
                  <span className="field-value">{user.email}</span>
                  <span className="field-info">Cannot be changed</span>
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">
                  <ShieldCheckIcon className="label-icon" />
                  Role
                </label>
                <div className="field-display">
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Organization */}
              <div className="form-group">
                <label className="form-label">
                  <BuildingOfficeIcon className="label-icon" />
                  Organization
                </label>
                <div className="field-display">
                  <span className="field-value">{organization?.name || 'Unknown'}</span>
                </div>
              </div>

              {/* Time Zone */}
              <div className="form-group">
                <label className="form-label">
                  <GlobeAltIcon className="label-icon" />
                  Time zone
                </label>
                {editing === 'timeZone' ? (
                  <div className="edit-field">
                    <select
                      value={formData.timeZone || ''}
                      onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
                      className="edit-select"
                      autoFocus
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={handleSaveField} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display" onClick={() => handleEditField('timeZone')}>
                    <span className="field-value">
                      {formData.timeZone === 'America/New_York' ? 'Eastern Time (ET)' :
                       formData.timeZone === 'America/Chicago' ? 'Central Time (CT)' :
                       formData.timeZone === 'America/Denver' ? 'Mountain Time (MT)' :
                       formData.timeZone === 'America/Los_Angeles' ? 'Pacific Time (PT)' :
                       formData.timeZone || 'Not set'}
                    </span>
                    <button className="edit-button">Edit</button>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <DevicePhoneMobileIcon className="label-icon" />
                  Phone (optional)
                </label>
                {editing === 'phone' ? (
                  <div className="edit-field">
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="edit-input"
                      autoFocus
                      placeholder="(555) 123-4567"
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveField} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display" onClick={() => handleEditField('phone')}>
                    <span className="field-value">{user.phone || 'Not set'}</span>
                    <button className="edit-button">Edit</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Login */}
          <div className="profile-card">
            <div className="card-header">
              <LockClosedIcon className="card-icon" />
              <h2 className="card-title">Security & Login</h2>
            </div>
            
            <div className="card-content">
              {/* Last Login */}
              <div className="form-group">
                <label className="form-label">
                  <ClockIcon className="label-icon" />
                  Last login
                </label>
                <div className="field-display">
                  <span className="field-value">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Change Password */}
              <div className="form-group">
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="action-button"
                >
                  <KeyIcon className="button-icon" />
                  Change password
                </button>
                
                {showChangePassword && (
                  <div className="change-password-form">
                    <form onSubmit={handleChangePassword}>
                      <div className="password-group">
                        <label>Current password</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value
                            })}
                            className="password-input"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current
                            })}
                            className="password-toggle"
                          >
                            {showPasswords.current ? (
                              <EyeSlashIcon className="toggle-icon" />
                            ) : (
                              <EyeIcon className="toggle-icon" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="password-group">
                        <label>New password</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => {
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                              });
                              calculatePasswordStrength(e.target.value);
                            }}
                            className="password-input"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new
                            })}
                            className="password-toggle"
                          >
                            {showPasswords.new ? (
                              <EyeSlashIcon className="toggle-icon" />
                            ) : (
                              <EyeIcon className="toggle-icon" />
                            )}
                          </button>
                        </div>
                        {passwordData.newPassword && (
                          <div className="password-strength">
                            <div className="strength-meter">
                              <div 
                                className={`strength-fill ${
                                  passwordStrength < 40 ? 'weak' :
                                  passwordStrength < 70 ? 'medium' : 'strong'
                                }`}
                                style={{ width: `${passwordStrength}%` }}
                              ></div>
                            </div>
                            <div className="strength-text">
                              Strength: {
                                passwordStrength < 40 ? 'Weak' :
                                passwordStrength < 70 ? 'Medium' : 'Strong'
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="password-group">
                        <label>Confirm new password</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value
                            })}
                            className="password-input"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm
                            })}
                            className="password-toggle"
                          >
                            {showPasswords.confirm ? (
                              <EyeSlashIcon className="toggle-icon" />
                            ) : (
                              <EyeIcon className="toggle-icon" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="password-actions">
                        <button type="submit" className="save-button">
                          Update password
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div className="form-group">
                <div className="toggle-group">
                  <div className="toggle-label">
                    <ShieldCheckIcon className="label-icon" />
                    <div>
                      <div className="toggle-title">Two-factor authentication</div>
                      <div className="toggle-description">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={user.twoFactorEnabled || false}
                      onChange={() => {/* TODO: Implement 2FA toggle */}}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <div className="form-group">
                  <div className="sessions-info">
                    <span className="sessions-count">
                      {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={handleLogoutAllDevices}
                      className="text-button"
                    >
                      Log out of all devices
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Role-specific */}
        <div className="profile-column">
          {/* Personal Preferences */}
          <div className="profile-card">
            <div className="card-header">
              <Cog6ToothIcon className="card-icon" />
              <h2 className="card-title">Personal Preferences</h2>
            </div>
            
            <div className="card-content">
              {/* Default Dashboard View */}
              <div className="form-group">
                <label className="form-label">
                  <ChartBarIcon className="label-icon" />
                  Default dashboard view
                </label>
                {editing === 'defaultDashboardView' ? (
                  <div className="edit-field">
                    <select
                      value={formData.defaultDashboardView || 'overview'}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultDashboardView: e.target.value
                      })}
                      className="edit-select"
                      autoFocus
                    >
                      <option value="overview">Overview</option>
                      <option value="donors">Donors</option>
                      <option value="donations">Donations</option>
                      <option value="tasks">Tasks</option>
                      <option value="reports">Reports</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={handleSaveField} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display" onClick={() => handleEditField('defaultDashboardView')}>
                    <span className="field-value">
                      {formData.defaultDashboardView === 'overview' ? 'Overview' :
                       formData.defaultDashboardView === 'donors' ? 'Donors' :
                       formData.defaultDashboardView === 'donations' ? 'Donations' :
                       formData.defaultDashboardView === 'tasks' ? 'Tasks' :
                       formData.defaultDashboardView === 'reports' ? 'Reports' :
                       'Overview'}
                    </span>
                    <button className="edit-button">Edit</button>
                  </div>
                )}
              </div>

              {/* Email Frequency */}
              <div className="form-group">
                <label className="form-label">
                  <EnvelopeIcon className="label-icon" />
                  Email frequency
                </label>
                {editing === 'emailFrequency' ? (
                  <div className="edit-field">
                    <select
                      value={formData.emailFrequency || 'INSTANT'}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailFrequency: e.target.value
                      })}
                      className="edit-select"
                      autoFocus
                    >
                      <option value="INSTANT">Instant (as they happen)</option>
                      <option value="DAILY_DIGEST">Daily digest</option>
                      <option value="WEEKLY_DIGEST">Weekly digest</option>
                      <option value="NONE">None</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={handleSaveField} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display" onClick={() => handleEditField('emailFrequency')}>
                    <span className="field-value">
                      {formData.emailFrequency === 'INSTANT' ? 'Instant' :
                       formData.emailFrequency === 'DAILY_DIGEST' ? 'Daily digest' :
                       formData.emailFrequency === 'WEEKLY_DIGEST' ? 'Weekly digest' :
                       formData.emailFrequency === 'NONE' ? 'None' :
                       'Instant'}
                    </span>
                    <button className="edit-button">Edit</button>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="form-group">
                <label className="form-label">
                  <BellIcon className="label-icon" />
                  Notification preferences
                </label>
                <div className="notification-preferences">
                  <div className="notification-item">
                    <label className="notification-label">
                      Donor updates
                    </label>
                    <label className="toggle-switch small">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences?.donorUpdates || false}
                        onChange={() => handleNotificationToggle('donorUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <label className="notification-label">
                      Task reminders
                    </label>
                    <label className="toggle-switch small">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences?.taskReminders || false}
                        onChange={() => handleNotificationToggle('taskReminders')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <label className="notification-label">
                      System alerts
                    </label>
                    <label className="toggle-switch small">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences?.systemAlerts || false}
                        onChange={() => handleNotificationToggle('systemAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <label className="notification-label">
                      Email notifications
                    </label>
                    <label className="toggle-switch small">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences?.emailNotifications || false}
                        onChange={() => handleNotificationToggle('emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <label className="notification-label">
                      Push notifications
                    </label>
                    <label className="toggle-switch small">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences?.pushNotifications || false}
                        onChange={() => handleNotificationToggle('pushNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific sections */}
          {isAdmin && (
            <>
              {/* Role & Permissions */}
              <div className="profile-card">
                <div className="card-header">
                  <ShieldCheckIcon className="card-icon" />
                  <h2 className="card-title">Role & Permissions</h2>
                </div>
                
                <div className="card-content">
                  <div className="permissions-list">
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>Manage users</span>
                    </div>
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>Manage donors</span>
                    </div>
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>View financials</span>
                    </div>
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>Export data</span>
                    </div>
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>Configure organization</span>
                    </div>
                    <div className="permission-item granted">
                      <CheckCircleIcon className="permission-icon" />
                      <span>Access all donor data</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Context */}
              <div className="profile-card">
                <div className="card-header">
                  <BuildingOfficeIcon className="card-icon" />
                  <h2 className="card-title">Organization Context</h2>
                </div>
                
                <div className="card-content">
                  <div className="organization-stats">
                    <div className="stat-item">
                      <div className="stat-label">Organization</div>
                      <div className="stat-value">{organization?.name}</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">Plan</div>
                      <div className="stat-value plan-badge">
                        {organization?.plan || 'FREE'}
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">Created</div>
                      <div className="stat-value">
                        {organization?.createdAt 
                          ? new Date(organization.createdAt).toLocaleDateString()
                          : 'Unknown'
                        }
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">Donors</div>
                      <div className="stat-value">
                        {organization?.donorCount?.toLocaleString() || '0'}
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">Staff</div>
                      <div className="stat-value">
                        {organization?.staffCount?.toLocaleString() || '1'}
                      </div>
                    </div>
                    
                    {organization?.trialEndsAt && (
                      <div className="stat-item">
                        <div className="stat-label">Trial ends</div>
                        <div className="stat-value">
                          {new Date(organization.trialEndsAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="organization-actions">
                    <button className="secondary-button">
                      Transfer ownership
                    </button>
                    <button className="danger-button">
                      <TrashIcon className="button-icon" />
                      Delete organization
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Admin Actions */}
              {recentAdminActions.length > 0 && (
                <div className="profile-card">
                  <div className="card-header">
                    <CalendarDaysIcon className="card-icon" />
                    <h2 className="card-title">Recent Admin Actions</h2>
                  </div>
                  
                  <div className="card-content">
                    <div className="audit-log">
                      {recentAdminActions.map((action, index) => (
                        <div key={index} className="audit-item">
                          <div className="audit-action">{action.action}</div>
                          <div className="audit-time">
                            {new Date(action.createdAt).toLocaleString()}
                          </div>
                          {action.details && (
                            <div className="audit-details">{action.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isStaff && (
            <>
              {/* Access Scope */}
              <div className="profile-card">
                <div className="card-header">
                  <EyeIcon className="card-icon" />
                  <h2 className="card-title">Access Scope</h2>
                </div>
                
                <div className="card-content">
                  <div className="access-scope">
                    <div className="scope-item">
                      <div className="scope-label">Role</div>
                      <div className="scope-value">{user.role}</div>
                    </div>
                    
                    <div className="scope-item">
                      <div className="scope-label">Data access</div>
                      <div className="scope-value">
                        {user.role === 'STAFF' ? 'Assigned donors only' : 'View only'}
                      </div>
                    </div>
                    
                    <div className="scope-item">
                      <div className="scope-label">Financial visibility</div>
                      <div className="scope-value">
                        {user.role === 'STAFF' ? 'Limited' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Work Context */}
              <div className="profile-card">
                <div className="card-header">
                  <UserGroupIcon className="card-icon" />
                  <h2 className="card-title">Assigned Work Context</h2>
                </div>
                
                <div className="card-content">
                  <div className="work-context">
                    <div className="work-stat">
                      <div className="work-stat-value">
                        {user.assignedDonorsCount?.toLocaleString() || '0'}
                      </div>
                      <div className="work-stat-label">Assigned donors</div>
                    </div>
                    
                    {user.primaryResponsibilities && (
                      <div className="responsibilities">
                        <div className="responsibilities-label">Primary responsibilities</div>
                        <div className="responsibilities-value">
                          {user.primaryResponsibilities}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}