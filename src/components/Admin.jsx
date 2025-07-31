import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDownIcon, Edit, Save, X, Eye, EyeOff, User, Mail, Phone, Calendar, Shield, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { Calendar as CalendarComponent } from './ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Admin = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

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

    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordErrors, setPasswordErrors] = useState({});

    // OTP Settings state
    const [otpSettings, setOtpSettings] = useState({
        otpEnabled: true,
        otpEnabledForRegistration: true,
        otpEnabledForLogin: true
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user || !user._id) {
                toast.error('No user ID found');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}user/getuser/${user._id}`, {
                    headers: {
                        'Authorization': `${localStorage.getItem('token')}`
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
            }
        };

        fetchUserData();
        fetchOtpSettings();
    }, [user]);

    const fetchOtpSettings = async () => {
        try {
            const response = await fetch(`${API_BASE}api/settings`, {
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOtpSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching OTP settings:', error);
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

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));

        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE}user/updateUser/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
                // Update local storage user data
                const updatedUser = { ...user, name: userData.username, email: userData.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!validatePasswordForm()) return;

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE}user/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Password updated successfully');
                setIsPasswordDialogOpen(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const handleOtpSettingChange = async (setting, value) => {
        setSavingSettings(true);
        try {
            const updatedSettings = { ...otpSettings, [setting]: value };
            const response = await fetch(`${API_BASE}api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedSettings)
            });

            const data = await response.json();
            if (data.success) {
                setOtpSettings(data.settings);
                toast.success('OTP settings updated successfully');
            } else {
                toast.error(data.error || 'Failed to update OTP settings');
            }
        } catch (error) {
            console.error('Error updating OTP settings:', error);
            toast.error('Failed to update OTP settings');
        } finally {
            setSavingSettings(false);
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

    const date = userData.dob ? new Date(userData.dob) : null;
    const error = !!errors.dob;

    const onDobChange = (val) => {
        handleInputChange('dob', val);
        if (error) setErrors(prev => ({ ...prev, dob: '' }));
    };

    if (loading) {
        return (
            <div className="p-2 bg-white">
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Admin Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setErrors({});
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setIsPasswordDialogOpen(true)}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Username */}
                            <div className="relative flex flex-col">
                                <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={userData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    disabled={!isEditing}
                                    className={`${errors.username ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-50' : ''}`}
                                />
                                {errors.username && <span className="text-red-500 text-xs mt-1">{errors.username}</span>}
                            </div>

                            {/* Email */}
                            <div className="relative flex flex-col">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={!isEditing}
                                    className={`${errors.email ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-50' : ''}`}
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                            </div>

                            {/* Phone */}
                            <div className="flex gap-2 items-end">
                                <div className="w-20">
                                    <Label className="text-sm font-medium text-gray-700 mb-2">Code</Label>
                                    <Select
                                        value={userData.countryCode}
                                        onValueChange={(value) => handleInputChange('countryCode', value)}
                                        disabled={!isEditing}
                                    >
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue>{userData.countryCode}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryCodes.map((country, index) => (
                                                <SelectItem key={index} value={country.code}>{country.code}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={userData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        maxLength={10}
                                        className={`${errors.phone ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-50' : ''}`}
                                    />
                                    {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Date of Birth */}
                            <div className="relative flex flex-col">
                                <Label htmlFor="dob" className="text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Date of Birth
                                </Label>
                                <Popover open={open} onOpenChange={setOpen} disabled={!isEditing}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            disabled={!isEditing}
                                            className={`w-full justify-start text-left font-normal ${error ? 'border-red-500 text-red-600' : 'border-gray-300'} ${!isEditing ? 'bg-gray-50' : ''}`}
                                        >
                                            {date ? date.toLocaleDateString() : 'Select Date of Birth'}
                                            <ChevronDownIcon className="ml-auto h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                if (selectedDate) {
                                                    onDobChange(selectedDate.toISOString().split('T')[0]);
                                                } else {
                                                    onDobChange('');
                                                }
                                                setOpen(false);
                                            }}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {userData.dob && !error && (
                                    <span className="text-gray-500 text-xs mt-1">Age: {calculateAge(userData.dob)} years</span>
                                )}
                                {error && <span className="text-red-500 text-xs mt-1">{errors.dob}</span>}
                            </div>

                            {/* Gender */}
                            <div className="relative flex flex-col">
                                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </Label>
                                <Select
                                    value={userData.gender}
                                    onValueChange={(value) => handleInputChange('gender', value)}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className={`${errors.gender ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-50' : ''}`}>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <span className="text-red-500 text-xs mt-1">{errors.gender}</span>}
                            </div>

                            {/* Role */}
                            <div className="relative flex flex-col">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2">
                                    <Settings className="w-4 h-4 inline mr-2" />
                                    Role
                                </Label>
                                <Input
                                    id="role"
                                    value={userData.role}
                                    disabled={true}
                                    className="border-gray-300 bg-gray-50"
                                />
                                <span className="text-gray-500 text-xs mt-1">Role cannot be changed</span>
                            </div>

                            {/* Verification Status */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={userData.verified}
                                    disabled={true}
                                    className="accent-blue-600 h-4 w-4 rounded"
                                />
                                <Label htmlFor="verified" className="text-sm font-medium text-gray-700">
                                    Verified Account
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OTP Settings Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">OTP Settings</h2>
                    </div>
                    <div className="space-y-6">
                        {/* Master OTP Toggle */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Master OTP Control</h3>
                                <p className="text-sm text-gray-600">Enable or disable OTP functionality globally</p>
                            </div>
                            <button
                                onClick={() => handleOtpSettingChange('otpEnabled', !otpSettings.otpEnabled)}
                                disabled={savingSettings}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    otpSettings.otpEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        otpSettings.otpEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Registration OTP Toggle */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Registration OTP</h3>
                                <p className="text-sm text-gray-600">Require OTP verification during user registration</p>
                            </div>
                            <button
                                onClick={() => handleOtpSettingChange('otpEnabledForRegistration', !otpSettings.otpEnabledForRegistration)}
                                disabled={savingSettings || !otpSettings.otpEnabled}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    otpSettings.otpEnabledForRegistration && otpSettings.otpEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                } ${!otpSettings.otpEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        otpSettings.otpEnabledForRegistration && otpSettings.otpEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Login OTP Toggle */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Login OTP</h3>
                                <p className="text-sm text-gray-600">Require OTP verification for unverified users during login</p>
                            </div>
                            <button
                                onClick={() => handleOtpSettingChange('otpEnabledForLogin', !otpSettings.otpEnabledForLogin)}
                                disabled={savingSettings || !otpSettings.otpEnabled}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    otpSettings.otpEnabledForLogin && otpSettings.otpEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                } ${!otpSettings.otpEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        otpSettings.otpEnabledForLogin && otpSettings.otpEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${otpSettings.otpEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                    OTP System: {otpSettings.otpEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            {!otpSettings.otpEnabled && (
                                <p className="text-xs text-gray-500 mt-1">
                                    When disabled, users can register without OTP verification. Login OTP only applies to unverified users.
                                </p>
                            )}
                            {otpSettings.otpEnabled && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Registration OTP: {otpSettings.otpEnabledForRegistration ? 'Enabled' : 'Disabled'} | 
                                    Login OTP: {otpSettings.otpEnabledForLogin ? 'Enabled' : 'Disabled'} (for unverified users only)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Current Password */}
                        <div className="relative">
                            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className={passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                            {passwordErrors.currentPassword && <span className="text-red-500 text-xs">{passwordErrors.currentPassword}</span>}
                        </div>

                        {/* New Password */}
                        <div className="relative">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className={passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && <span className="text-red-500 text-xs">{passwordErrors.newPassword}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className={passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                            {passwordErrors.confirmPassword && <span className="text-red-500 text-xs">{passwordErrors.confirmPassword}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsPasswordDialogOpen(false);
                                setPasswordData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                });
                                setPasswordErrors({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePasswordUpdate}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Admin;
