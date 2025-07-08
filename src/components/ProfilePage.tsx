import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Download, 
  Upload, 
  LogOut, 
  User as UserIcon, 
  Save, 
  Edit2, 
  ChevronRight,
  Zap,
  Crown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../lib/supabase';

const ProfilePage = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    website: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user?.user_metadata?.fullName || '',
        username: user?.user_metadata?.username || '',
        website: user?.user_metadata?.website || '',
        location: user?.user_metadata?.location || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error('Not authenticated');
      
      const { data } = await authService.updateUser({
        data: {
          fullName: profileData.fullName,
          username: profileData.username,
          website: profileData.website,
          location: profileData.location,
        }
      });

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-3xl text-slate-300">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-50">{profileData.fullName || user?.email}</h2>
          <p className="text-slate-400">@{profileData.username || 'username'}</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-slate-50 mb-6 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Profile Information
          </h3>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="profile-fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="profile-fullName"
                name="fullName"
                type="text"
                value={profileData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-slate-300 ${
                  isEditing ? 'border-indigo-500/50' : 'border-slate-600/50 cursor-not-allowed'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="profile-username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="profile-username"
                name="username"
                type="text"
                value={profileData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-slate-300 ${
                  isEditing ? 'border-indigo-500/50' : 'border-slate-600/50 cursor-not-allowed'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="profile-website" className="block text-sm font-medium text-slate-300 mb-2">
                Website
              </label>
              <input
                id="profile-website"
                name="website"
                type="text"
                value={profileData.website}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-slate-300 ${
                  isEditing ? 'border-indigo-500/50' : 'border-slate-600/50 cursor-not-allowed'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="profile-location" className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                id="profile-location"
                name="location"
                type="text"
                value={profileData.location}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-slate-300 ${
                  isEditing ? 'border-indigo-500/50' : 'border-slate-600/50 cursor-not-allowed'
                }`}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset profileData to original values
                      setProfileData({
                        fullName: user?.user_metadata?.fullName || '',
                        username: user?.user_metadata?.username || '',
                        website: user?.user_metadata?.website || '',
                        location: user?.user_metadata?.location || '',
                      });
                    }}
                    className="px-4 py-2 text-slate-300 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all duration-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Account Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6">
          <h3 className="text-xl font-semibold text-slate-50 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Notifications</span>
              </div>
              <button className="px-4 py-2 text-slate-300 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                Manage
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Privacy & Security</span>
              </div>
              <button className="px-4 py-2 text-slate-300 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                Review
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Billing & Subscriptions</span>
              </div>
              <button className="px-4 py-2 text-slate-300 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                Update
              </button>
            </div>
          </div>
          
          <button 
            onClick={signOut}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
