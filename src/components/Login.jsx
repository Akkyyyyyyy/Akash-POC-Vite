import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from './ui/dialog';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE);


const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
const [forgotEmailError, setForgotEmailError] = useState('');
const [forgotLoading, setForgotLoading] = useState(false);


  // OTP related states
  const [OTPDialog, setOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [userIdForOtp, setUserIdForOtp] = useState(null);

  const user = localStorage.getItem('user');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleLogin = async () => {
    console.log("Sending login request with: ", {
      email: form.email.trim().toLowerCase(),
      password: form.password
    });

    let hasError = false;
    setEmailError('');
    setPasswordError('');

    if (form.email.trim() === '') {
      setEmailError('Email is required!');
      hasError = true;
    }
    if (form.password.trim() === '') {
      setPasswordError('Password is required!');
      hasError = true;
    }
    if (hasError) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Handle OTP required response
        if (data.requiresOtp) {
          setUserIdForOtp(data.userId);
          setOTPDialog(true);
          return;
        }

        const errMsg = (data?.message || data?.error || 'Login failed');

        if (errMsg.toLowerCase().includes('email')) setEmailError(errMsg);
        else if (errMsg.toLowerCase().includes('password')) setPasswordError(errMsg);
        else toast.error(errMsg);
        return;
      }

      // Success login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdForOtp, otp })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "OTP verification failed");
        return;
      }

      toast.success("OTP verified successfully! Please login again.");
      setOTPDialog(false);
      setUserIdForOtp(null);
      setOtp('');
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Network error. Try again.");
    }
  };

  const handleForgotPassword = async () => {
    // Validate email
    if (forgotEmail.trim() === '') {
      setForgotEmailError('Email is required!');
      return;
    }
  
    // Simple email format check (you can use a better regex if needed)
    if (!/\S+@\S+\.\S+/.test(forgotEmail.trim())) {
      setForgotEmailError('Please enter a valid email address!');
      return;
    }
  
    try {
      setForgotLoading(true);
      const res = await fetch(`${API_BASE}user/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        toast.error(data.message || data.error || 'Failed to send reset link.');
        return;
      }
      console.log(data);
  
      toast.success('Password reset link sent! Check your email.');
      setForgotEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-[#003153]">
      <div className="bg-white p-10 flex flex-col justify-center items-center min-w-md shadow-xl/30 gap-5">
        <h1 className="text-4xl font-semibold mb-5">LOGIN</h1>
        <span className="w-1/2 border-1 mb-7 bg-[#003153] h-1" />

        <div className="relative flex flex-col w-full">
          <input
            type="email"
            className={`p-2 pl-3 pr-8 outline-none border-b-2 rounded-xs ${
              emailError ? 'border-red-400' : 'border-gray-400'
            }`}
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (emailError) setEmailError('');
            }}
          />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        <div className="relative flex flex-col w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`p-2 pl-3 pr-8 outline-none border-b-2 rounded-xs ${
              passwordError ? 'border-red-400' : 'border-gray-400'
            }`}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (passwordError) setPasswordError('');
            }}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>

        {/* Forgot Password Dialog */}
        {/* Forgot Password Dialog */}
<div className="w-full">
  <Dialog>
    <DialogTrigger>
      <button className="text-[#003153] cursor-pointer hover:underline">Forgot password?</button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
      </DialogHeader>
      <DialogDescription className="flex flex-col">
        <p className="text-sm">Enter your email to reset your password</p>
        <input
          type="email"
          className={`p-2 my-2 outline-none border-b-2 rounded-xs ${
            forgotEmailError ? 'border-red-400' : 'border-gray-400'
          }`}
          placeholder="Enter your email"
          value={forgotEmail}
          onChange={(e) => {
            setForgotEmail(e.target.value);
            if (forgotEmailError) setForgotEmailError('');
          }}
          disabled={forgotLoading}
        />
        {forgotEmailError && <p className="text-red-500 text-xs mt-1">{forgotEmailError}</p>}
      </DialogDescription>
      <DialogFooter>
        <DialogClose asChild>
          <button className="bg-gray-300 text-black p-2 rounded-3xl w-24 cursor-pointer" disabled={forgotLoading}>
            Back
          </button>
        </DialogClose>
        <button
          onClick={handleForgotPassword}
          className={`bg-[#003153] text-white p-2 rounded-3xl w-48 cursor-pointer ${
            forgotLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={forgotLoading}
        >
          {forgotLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>


        {/* Login Button */}
        <button
          disabled={isLoading}
          onClick={handleLogin}
          className={`bg-[#003153] text-white p-2 w-full text-xl font-semibold border-2 border-[#003153] hover:bg-white hover:text-[#003153] transition ease-in-out duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Signup Link */}
        <div className="flex flex-col w-full justify-center items-center">
          <Link to="/signup" className="text-[#003153] hover:underline cursor-pointer">
            Don't have an account?
          </Link>
        </div>

        {/* OTP Verification Dialog */}
        <Dialog open={OTPDialog} onOpenChange={setOTPDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Verification</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <p className="mb-2">Enter the 6-digit OTP sent to your email.</p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-2 outline-none border-b-2 border-gray-400 rounded-xs w-full"
                placeholder="Enter OTP"
              />
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <button className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
              </DialogClose>
              <button onClick={handleVerifyOtp} className="bg-[#003153] text-white px-6 py-2 rounded-md">
                Verify OTP
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
