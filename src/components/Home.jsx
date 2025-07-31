import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/user/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Coming Soon</h1>
      <button
        onClick={handleLogout}
        className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
