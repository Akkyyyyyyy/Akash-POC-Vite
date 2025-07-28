import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
      const errMsg = (data?.message || data?.error || 'Login failed').toLowerCase();

        if (errMsg.includes('email')) setEmailError(data.error);
        else if (errMsg.includes('password')) setPasswordError(data.error);
        else alert(errMsg);
        return;
      }

      // ✅ Save token & user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login successful!');
      navigate('/dashboard'); // Or wherever you want to redirect

    } catch (err) {
      console.error('Login Error:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#003153]">
      <div className="bg-white p-10 flex flex-col justify-center items-center min-w-md shadow-xl/30 gap-5">
        <h1 className="text-4xl font-semibold mb-5">LOGIN</h1>
        <span className="w-1/2 border-1 mb-7 bg-[#003153] h-1" />

        {/* Email Input */}
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
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative flex flex-col w-full">
          <input
            type="password"
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
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>

        {/* Forgot Password */}
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
                  className="p-2 my-2 outline-none border-b-2 border-gray-400 rounded-xs"
                  placeholder="Enter your email"
                />
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="bg-[#003153] text-white p-2 rounded-md">Back</button>
                </DialogClose>
                <button className="bg-[#003153] text-white p-2 rounded-md">Reset Password</button>
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
      </div>
    </div>
  );
};

export default Login;
