import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error handling
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
    hasSpecial: false,
  });

  const checkPasswordStrength = (value) => {
    setPasswordStrength({
      length: value.length >= 6,
      hasNumber: /\d/.test(value),
      hasLetter: /[a-zA-Z]/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');

    if (!password || password.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}user/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.message?.toLowerCase().includes('token')) {
          setPasswordError(data.message);
        } else {
          toast.error(data.message || 'Failed to reset password.');
        }
        return;
      }

      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#003153] p-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 w-full max-w-md shadow-xl flex flex-col gap-5 "
      >
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>


        <div className="relative flex flex-col">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            maxLength={16}
            onChange={(e) => {
              setPassword(e.target.value);
              checkPasswordStrength(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            className={`cursor-pointer p-2 pl-3 pr-10 border-b-2 outline-none ${passwordError ? 'border-red-500' : 'border-gray-400'}`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}

          {password && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1">
                {passwordStrength.length ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />}
                <span className={passwordStrength.length ? 'text-green-600' : 'text-red-600'}>Min. 6 characters</span>
              </div>
              <div className="flex items-center gap-1">
                {passwordStrength.hasLetter ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />}
                <span className={passwordStrength.hasLetter ? 'text-green-600' : 'text-red-600'}>Letters</span>
              </div>
              <div className="flex items-center gap-1">
                {passwordStrength.hasNumber ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />}
                <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-red-600'}>Numbers</span>
              </div>
              <div className="flex items-center gap-1">
                {passwordStrength.hasSpecial ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />}
                <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-red-600'}>Special char</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex flex-col">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            maxLength={16}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            className={`cursor-pointer p-2 pl-3 pr-10 border-b-2 outline-none ${confirmPasswordError ? 'border-red-500' : 'border-gray-400'}`}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
        </div>

   
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer w-full py-2 mt-2 border-2 font-semibold border-[#003153] bg-[#003153] text-white hover:bg-white  hover:text-[#003153] transition disabled:opacity-50`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
