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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';

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
    const [open, setOpen] = useState(false); 


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
            const response = await fetch(`${API_BASE}user/getuser/${userId}`, {
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

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const url = operation === 'create'
                ? `${API_BASE}user/users`
                : `${API_BASE}user/updateUser/${userId}`;

            const method = operation === 'create' ? 'POST' : 'PUT';
            console.log(userData);
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
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


    const date = userData.dob ? new Date(userData.dob) : null;
    const error = !!errors.dob;
    const disabled = operation === 'view';

    const onDobChange = (val) => {
        handleInputChange('dob', val);
        if (error) setErrors(prev => ({ ...prev, dob: '' }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="w-[95vw] max-w-md bg-white rounded-3xl shadow-2xl border-0 p-0"
                style={{
                    maxHeight: '90vh',
                    overflow: 'hidden',
                }}
            >
                <div className="w-full flex flex-col px-6 py-8 max-h-[85vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 w-full text-center">
                        {getDialogTitle()}
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 rounded-full mb-6 mx-auto" />
                    {loading ? (
                        <div className="flex justify-center items-center py-16 text-gray-500 w-full">Loading...</div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="w-full flex flex-col gap-4"
                        >
                            {/* Username */}
                            <div className="relative flex flex-col">
                                <Input
                                    id="username"
                                    value={userData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    disabled={operation === 'view'}
                                    className={`peer h-12 px-3 pt-6 pb-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-transparent`}
                                    autoComplete="off"
                                    placeholder=" "
                                />
                                <Label htmlFor="username" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                    Username
                                </Label>
                                {errors.username && <span className="text-red-500 text-xs mt-1 font-medium">{errors.username}</span>}
                            </div>
                            {/* Email */}
                            <div className="relative flex flex-col">
                                <Input
                                    id="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={operation === 'view'}
                                    className={`peer h-12 px-3 pt-6 pb-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-transparent`}
                                    autoComplete="off"
                                    placeholder=" "
                                />
                                <Label htmlFor="email" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                    Email
                                </Label>
                                {errors.email && <span className="text-red-500 text-xs mt-1 font-medium">{errors.email}</span>}
                            </div>
                            {/* Phone */}
                            <div className="flex gap-2 items-end">
                                <Select
                                    value={userData.countryCode}
                                    onValueChange={(value) => handleInputChange('countryCode', value)}
                                    disabled={operation === 'view'}
                                >
                                    <SelectTrigger className="w-20 h-12 border-gray-300 rounded-lg text-sm">
                                        <SelectValue>{userData.countryCode}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countryCodes.map((country, index) => (
                                            <SelectItem key={index} value={country.code}>{country.code}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="relative flex-1 flex flex-col">
                                    <Input
                                        id="phone"
                                        placeholder=" "
                                        maxLength={10}
                                        value={userData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                                        disabled={operation === 'view'}
                                        className={`peer h-12 px-3 pt-6 pb-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-transparent`}
                                        autoComplete="off"
                                    />
                                    <Label htmlFor="phone" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                        Phone Number
                                    </Label>
                                    {errors.phone && <span className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</span>}
                                </div>
                            </div>
                            {/* DOB */}
                            <div className="relative flex flex-col">
                                <Popover open={open} onOpenChange={setOpen} disabled={disabled}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            id="date"
                                            disabled={disabled}
                                            className={`peer h-12 px-3 pt-6 pb-2 border w-full text-left flex items-center justify-between ${error ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'} rounded-lg bg-white mt-0`}
                                        >
                                            {date ? date.toLocaleDateString() : 'Select Date of Birth'}
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            defaultMonth={date || undefined}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                if (selectedDate) {
                                                    onDobChange(selectedDate.toISOString().split('T')[0]);
                                                } else {
                                                    onDobChange('');
                                                }
                                                setOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Label htmlFor="dob" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                    Date of Birth
                                </Label>
                                {userData.dob && operation === 'view' && !error && (
                                    <span className="text-gray-500 text-xs mt-1">Age: {calculateAge(userData.dob)} years</span>
                                )}
                                {error && <span className="text-red-500 text-xs mt-1 font-medium">{errors.dob}</span>}
                            </div>
                            {/* Gender */}
                            <div className="relative flex flex-col">
                                <Select
                                    value={userData.gender}
                                    onValueChange={(value) => handleInputChange('gender', value)}
                                    disabled={operation === 'view'}
                                >
                                    <SelectTrigger className={`peer h-12 mt-0 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white`}> 
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Label htmlFor="gender" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                    Gender
                                </Label>
                                {errors.gender && <span className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</span>}
                            </div>
                            {/* Role */}
                            <div className="relative flex flex-col">
                                <Select
                                    value={userData.role}
                                    onValueChange={(value) => handleInputChange('role', value)}
                                    disabled={operation === 'view'}
                                >
                                    <SelectTrigger className="peer h-12 mt-0 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Label htmlFor="role" className="absolute left-3 top-2 text-gray-500 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 font-semibold bg-white px-1 pointer-events-none">
                                    Role
                                </Label>
                            </div>
                            {/* Verified */}
                            <div className="flex items-center space-x-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={userData.verified}
                                    onChange={(e) => handleInputChange('verified', e.target.checked)}
                                    disabled={operation === 'view'}
                                    className="accent-blue-600 h-4 w-4 rounded"
                                />
                                <Label htmlFor="verified" className="text-sm font-semibold text-gray-700">Verified</Label>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-6 w-full">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={saving}
                                    type="button"
                                    className="rounded-lg px-4 py-2 font-semibold w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                {operation !== 'view' && (
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg px-4 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                    >
                                        {saving ? 'Saving...' : operation === 'create' ? 'Create' : 'Update'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateDialog;
