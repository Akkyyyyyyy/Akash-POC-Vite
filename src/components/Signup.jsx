import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { ChevronDownIcon, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { countryCodes } from './cc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';

const API_BASE = import.meta.env.VITE_API_BASE_URL;


const Signup = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState();
    const [gender, setGender] = useState('Select your Gender');
    const [countryCode, setCountryCode] = useState('+91');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [dobError, setDobError] = useState(false);
    const [genderError, setGenderError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);


    const [usernameErrorMsg, setUsernameErrorMsg] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const [phoneErrorMsg, setPhoneErrorMsg] = useState('');
    const [dobErrorMsg, setDobErrorMsg] = useState('');
    const [genderErrorMsg, setGenderErrorMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState('');
    const user = localStorage.getItem('user');

    useEffect(() => {
        if (user) navigate('/dashboard')
    }, [user, navigate])


    // Password strength states
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        hasNumber: false,
        hasLetter: false,
        hasSpecial: false
    });

    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        password: '',
        confirmPassword: ''
    })

    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [pendingUserId, setPendingUserId] = useState(null);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateUsername = (username) => {
        return username.length >= 3 && username.length <= 30;
    };

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            length: password.length >= 6,
            hasNumber: /\d/.test(password),
            hasLetter: /[a-zA-Z]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    };

    const resetAllErrors = () => {
        setUsernameError(false);
        setEmailError(false);
        setPhoneError(false);
        setDobError(false);
        setGenderError(false);
        setPasswordError(false);
        setConfirmPasswordError(false);
        setUsernameErrorMsg('');
        setEmailErrorMsg('');
        setPhoneErrorMsg('');
        setDobErrorMsg('');
        setGenderErrorMsg('');
        setPasswordErrorMsg('');
        setConfirmPasswordErrorMsg('');
    };

    const handlesignup = async () => {
        resetAllErrors();
        let hasError = false;

        // Frontend validations (unchanged from your original)
        if (form.username.trim() === "") {
            setUsernameErrorMsg('Username is required!');
            setUsernameError(true);
            hasError = true;
        } else if (!validateUsername(form.username)) {
            setUsernameErrorMsg('Username must be between 3 and 30 characters!');
            setUsernameError(true);
            hasError = true;
        }

        if (form.email.trim() === "") {
            setEmailErrorMsg('Email is required!');
            setEmailError(true);
            hasError = true;
        } else if (!validateEmail(form.email)) {
            setEmailErrorMsg('Please enter a valid email address!');
            setEmailError(true);
            hasError = true;
        }

        if (form.phone.trim() === "") {
            setPhoneErrorMsg('Phone number is required!');
            setPhoneError(true);
            hasError = true;
        } else if (!validatePhone(form.phone)) {
            setPhoneErrorMsg('Phone number must be exactly 10 digits!');
            setPhoneError(true);
            hasError = true;
        }

        if (form.dob.trim() === "") {
            setDobErrorMsg('Date of birth is required!');
            setDobError(true);
            hasError = true;
        } else if (date && date > new Date()) {
            setDobErrorMsg('Date of birth cannot be in the future!');
            setDobError(true);
            hasError = true;
        }

        if (form.gender.trim() === "" || form.gender === 'Select your Gender') {
            setGenderErrorMsg('Gender is required!');
            setGenderError(true);
            hasError = true;
        }

        if (form.password.trim() === "") {
            setPasswordErrorMsg('Password is required!');
            setPasswordError(true);
            hasError = true;
        } else if (!validatePassword(form.password)) {
            setPasswordErrorMsg('Password must be at least 6 characters long!');
            setPasswordError(true);
            hasError = true;
        }

        if (form.confirmPassword.trim() === "") {
            setConfirmPasswordErrorMsg('Confirm password is required!');
            setConfirmPasswordError(true);
            hasError = true;
        } else if (form.password.trim() !== form.confirmPassword.trim()) {
            setConfirmPasswordErrorMsg('Passwords do not match!');
            setConfirmPasswordError(true);
            hasError = true;
        }

        if (hasError) return;

        // Submit to backend
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim().replace(/\D/g, ''),
                    dob: form.dob,
                    gender: form.gender.toLowerCase(),
                    password: form.password,
                    countryCode: countryCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorText = data?.error || data?.message || 'Registration failed. Please try again.';
                // console.log(errorText);


                if (errorText.toLowerCase().includes('username')) {
                    setUsernameError(true);
                    setUsernameErrorMsg(errorText);
                } else if (errorText.toLowerCase().includes('email')) {
                    setEmailError(true);
                    setEmailErrorMsg(errorText);
                } else if (errorText.toLowerCase().includes('phone')) {
                    setPhoneError(true);
                    setPhoneErrorMsg(errorText);
                } else if (errorText.toLowerCase().includes('must be 18') || errorText.toLowerCase().includes('old')) {
                    setDobError(true);
                    setDobErrorMsg(errorText);
                } else if (errorText.toLowerCase().includes('gender')) {
                    setGenderError(true);
                    setGenderErrorMsg(errorText);
                } else if (errorText.toLowerCase().includes('password')) {
                    setPasswordError(true);
                    setPasswordErrorMsg(errorText);
                } else {
                    // alert(errorText);
                }
                return
            }

            // OTP flow
            setPendingUserId(data.userId);
            setShowOtpDialog(true);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpError('');
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter the 6-digit OTP sent to your email.');
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: pendingUserId, otp })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setOtpError(data.error || 'Invalid OTP.');
                return;
            }
            alert('Account created successfully!');
            setShowOtpDialog(false);
            navigate('/login');
        } catch (err) {
            setOtpError('Network error. Please try again.');
        }
    };

    return (
        <div className='flex justify-center items-center h-screen bg-[#003153] p-2'>
            <div className='bg-white p-6 flex flex-col justify-center items-center w-full max-w-xl shadow-xl/30 gap-3'>
                <h1 className='text-3xl font-semibold mb-3'>SIGN UP</h1>
                <span className='w-1/2 border-1 mb-3 bg-[#003153] h-1' />

                <div className="w-full space-y-3">
                    {/* Row 1: Username only */}
                    <div className="relative flex flex-col w-full">
                        <input
                            type="text"
                            className={`p-2 pl-3 pr-8 outline-none border-b-2 border-gray-400 rounded-xs ${usernameError ? 'border-red-400' : ''}`}
                            placeholder="Enter your Username"
                            value={form.username}
                            onChange={(e) => {
                                setForm({ ...form, username: e.target.value })
                                if (usernameError) {
                                    setUsernameError(false)
                                    setUsernameErrorMsg('')
                                }
                            }}
                        />
                        {usernameError && (
                            <p className="text-red-500 text-xs mt-1">{usernameErrorMsg}</p>
                        )}
                    </div>

                    {/* Row 2: Email and Phone number */}
                    <div className="flex space-x-3">
                        <div className="relative flex flex-col flex-1">
                            <input
                                type='email'
                                className={`p-2 pl-3 pr-8 outline-none border-b-2 border-gray-400 rounded-xs ${emailError ? 'border-red-400' : ''}`}
                                placeholder='Enter your email'
                                value={form.email}
                                onChange={(e) => {
                                    setForm({ ...form, email: e.target.value })
                                    if (emailError) {
                                        setEmailError(false)
                                        setEmailErrorMsg('')
                                    }
                                }}
                            />
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1">{emailErrorMsg}</p>
                            )}
                        </div>

                        <div className="relative flex space-x-2 flex-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={`w-16 h-full p-2 text-center border-b-2 border-gray-400 outline-none bg-white text-gray-500 rounded-xs flex justify-between items-center text-xs ${phoneError ? 'border-red-400' : ''}`}
                                    >
                                        {countryCode}
                                        <ChevronDownIcon className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40 max-h-60 overflow-y-auto">
                                    <DropdownMenuLabel>Select Country Code</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {countryCodes.map((country, index) => (
                                        <DropdownMenuItem
                                            key={index}
                                            onClick={() => setCountryCode(country.code)}
                                            className="flex justify-between"
                                        >
                                            <span>{country.code}</span>
                                            <span className="text-gray-500 text-xs">{country.country}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter Mobile number"
                                    className={`w-full p-2 pl-3 pr-8 outline-none border-b-2 border-gray-400 ${phoneError ? 'border-red-400' : ''}`}
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={(e) => {
                                        // Only allow numbers
                                        const value = e.target.value.replace(/\D/g, '');
                                        setForm({ ...form, phone: value })
                                        if (phoneError) {
                                            setPhoneError(false)
                                            setPhoneErrorMsg('')
                                        }
                                    }}
                                />
                                {phoneError && (
                                    <p className="text-red-500 text-xs mt-1">{phoneErrorMsg}</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Row 3: Date of Birth and Gender */}
                    <div className="flex space-x-3">
                        <div className='relative flex flex-col flex-1'>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        id="date"
                                        className={`outline-none text-sm font-normal border-0 border-b-2 border-gray-400 bg-#fff text-gray-500 rounded-xs text-left w-full flex justify-between items-center pr-8 p-2 ${dobError ? 'border-red-400' : ''}`}
                                    >
                                        {date ? date.toLocaleDateString() : "Select Date of Birth"}
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setDate(date)
                                            setForm({ ...form, dob: date ? date.toLocaleDateString() : '' })
                                            if (dobError) {
                                                setDobError(false)
                                                setDobErrorMsg('')
                                            }
                                            setOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='relative flex flex-col flex-1'>
                            <DropdownMenu >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`outline-none text-sm font-normal border-0 border-b-2 border-gray-400 bg-#fff text-gray-500 rounded-xs text-left w-full flex justify-between items-center pr-8 p-2 ${genderError ? 'border-red-400' : ''}`}
                                    >
                                        {gender}  <ChevronDownIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-40">
                                    <DropdownMenuRadioGroup value={gender} onValueChange={(value) => {
                                        setGender(value)
                                        setForm({ ...form, gender: value })
                                        if (genderError) {
                                            setGenderError(false)
                                            setGenderErrorMsg('')
                                        }
                                    }}>
                                        <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Other">Other</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {(dobError || genderError) && (
                        <div className="flex space-x-3">
                            <div className="flex-1">
                                {dobError && <p className="text-red-500 text-xs mt-1">{dobErrorMsg}</p>}
                            </div>
                            <div className="flex-1">
                                {genderError && <p className="text-red-500 text-xs mt-1">{genderErrorMsg}</p>}
                            </div>
                        </div>
                    )}


                    <div className='relative flex flex-col w-full'>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`w-full not-last:not-only:p-2 pl-3 pr-12 outline-none border-b-2 border-gray-400 rounded-xs ${passwordError ? 'border-red-400' : ''}`}
                                placeholder='Enter your Password'
                                value={form.password}
                                maxLength={16}
                                onChange={(e) => {
                                    setForm({ ...form, password: e.target.value })
                                    checkPasswordStrength(e.target.value);
                                    if (passwordError) {
                                        setPasswordError(false)
                                        setPasswordErrorMsg('')
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>


                        {form.password && (
                            <div className="mt-2 space-y-1 flex gap-2">
                                <div className="flex items-center space-x-1 text-xs">
                                    {passwordStrength.length ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                    <span className={passwordStrength.length ? 'text-green-600' : 'text-red-600'}>At least 6 characters</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs">
                                    {passwordStrength.hasLetter ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                    <span className={passwordStrength.hasLetter ? 'text-green-600' : 'text-red-600'}>Contains letter</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs">
                                    {passwordStrength.hasNumber ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-red-600'}>Contains number</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs">
                                    {passwordStrength.hasSpecial ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                    <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-red-600'}>Contains special character</span>
                                </div>
                            </div>
                        )}

                        {passwordError && (
                            <p className="text-red-500 text-xs mt-1">{passwordErrorMsg}</p>
                        )}
                    </div>

                    <div className='relative flex flex-col w-full'>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                maxLength={16}
                                className={`w-full p-2 pl-3 pr-12 outline-none border-b-2 border-gray-400 rounded-xs ${confirmPasswordError ? 'border-red-400' : ''}`}
                                placeholder='Confirm Password'
                                value={form.confirmPassword}
                                onChange={(e) => {
                                    setForm({ ...form, confirmPassword: e.target.value })
                                    if (confirmPasswordError) {
                                        setConfirmPasswordError(false)
                                        setConfirmPasswordErrorMsg('')
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPasswordError && (
                            <p className="text-red-500 text-xs mt-1">{confirmPasswordErrorMsg}</p>
                        )}
                    </div>

                    {/* Button and Link */}
                    <div className="w-full mt-4">
                        <button
                            className='bg-[#003153] text-white p-2 w-full cursor-pointer hover:bg-white text-lg font-semibold border border-[#003153] hover:text-[#003153] transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={() => handlesignup()}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign up'}
                        </button>
                        <div className='flex flex-col w-full justify-center items-center mt-3'>
                            <Link to={'/login'} className='text-[#003153] hover:underline cursor-pointer text-sm'>Already have an account?</Link>
                        </div>
                    </div>
                </div>

            </div >

            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter OTP</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="flex flex-col gap-2">
                        <input
                            type="text"
                            maxLength={6}
                            className={`p-2 pl-3 pr-8 outline-none border-b-2 rounded-xs text-left tracking-widest text-lg ${otpError ? 'border-red-400' : 'border-gray-400'
                                }`}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={handleVerifyOtp} className="w-full rounded-none bg-[#003153] hover:bg-[#003153]">
                            Verify OTP
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div >
    )
}

export default Signup