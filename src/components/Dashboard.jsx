import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE = 'http://localhost:5000/user/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [todayCount, setTodayCount] = useState(0);
  const [period, setPeriod] = useState('week');
  const [periodCount, setPeriodCount] = useState(0);
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    fetch(`${API_BASE}/today`)
      .then(res => res.json())
      .then(data => setTodayCount(data.count || 0));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/period?period=${period}`)
      .then(res => res.json())
      .then(data => setPeriodCount(data.count || 0));
  }, [period]);

  useEffect(() => {
    fetch(`${API_BASE}/gender`)
      .then(res => res.json())
      .then(data => {
        setGenderData([
          { name: 'Male', value: data.male || 0 },
          { name: 'Female', value: data.female || 0 }
        ]);
      });
  }, []);

  const COLORS = ['#2563eb', '#ec4899']; // blue and pink

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chart 1: Today */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Today's Registrations</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: 'Today', count: todayCount }]}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Period */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Registrations</h2>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="">All Time</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: period || 'All', count: periodCount }]}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Gender */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
