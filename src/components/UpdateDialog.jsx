import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { countryCodes } from './cc';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const UpdateDialog = ({ isOpen, onClose, userId, operation }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    countryCode: '+91',
    phone: '',
    dob: '',
    gender: '',
    role: 'user',
    verified: false
  });
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (operation === 'create') {
        setUserData({
          username: '',
          email: '',
          countryCode: '+91',
          phone: '',
          dob: '',
          gender: '',
          role: 'user',
          verified: false
        });
        setErrors({});
      } else if (userId && (operation === 'edit' || operation === 'view')) {
        fetchUserData();
      }
    }
  }, [isOpen, userId, operation]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}user/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserData({
          username: data.user.username || '',
          email: data.user.email || '',
          countryCode: data.user.countryCode || '+91',
          phone: data.user.phone || '',
          dob: data.user.dob ? new Date(data.user.dob).toISOString().split('T')[0] : '',
          gender: data.user.gender || '',
          role: data.user.role || 'user',
          verified: data.user.verified || false
        });
      } else {
        toast.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (userData.username.length < 3 || userData.username.length > 20) {
      newErrors.username = 'Username must be 3-20 characters';
    }

    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!userData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(userData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!userData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(userData.dob);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (dobDate > minAgeDate) {
        newErrors.dob = 'User must be at least 18 years old';
      }
    }

    if (!userData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = operation === 'create' 
        ? `${API_BASE}user/users`
        : `${API_BASE}user/users/${userId}`;
      
      const method = operation === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(operation === 'create' ? 'User created successfully' : 'User updated successfully');
        onClose();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const getDialogTitle = () => {
    switch (operation) {
      case 'create': return 'Create New User';
      case 'edit': return 'Edit User';
      case 'view': return 'View User Details';
      default: return 'User';
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={userData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={operation === 'view'}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={operation === 'view'}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={userData.countryCode}
                  onValueChange={(value) => handleInputChange('countryCode', value)}
                  disabled={operation === 'view'}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country, index) => (
                      <SelectItem key={index} value={country.code}>
                        {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                  disabled={operation === 'view'}
                  placeholder="Enter phone number"
                  maxLength={10}
                  className={errors.phone ? 'border-red-500' : ''}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={userData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                disabled={operation === 'view'}
                className={errors.dob ? 'border-red-500' : ''}
              />
              {userData.dob && operation === 'view' && (
                <p className="text-gray-500 text-xs mt-1">Age: {calculateAge(userData.dob)} years</p>
              )}
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={userData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                disabled={operation === 'view'}
              >
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={userData.role}
                onValueChange={(value) => handleInputChange('role', value)}
                disabled={operation === 'view'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified"
                checked={userData.verified}
                onChange={(e) => handleInputChange('verified', e.target.checked)}
                disabled={operation === 'view'}
                className="rounded"
              />
              <Label htmlFor="verified">Verified Account</Label>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {operation === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {operation !== 'view' && (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (operation === 'create' ? 'Create User' : 'Update User')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;
