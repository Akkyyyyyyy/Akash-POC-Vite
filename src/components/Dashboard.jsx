import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

const API_BASE = 'http://localhost:5000/user/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayLabel, setTodayLabel] = useState('');
  const [period, setPeriod] = useState('week');
  const [periodCount, setPeriodCount] = useState(0);
  const [genderData, setGenderData] = useState([]);
  const [loading, setLoading] = useState({
    weekly: true,
    period: true,
    gender: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    setLoading(prev => ({...prev, weekly: true}));
    fetch(`${API_BASE}/week`)
      .then(res => res.json())
      .then(data => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        setTodayLabel(today);
        // Ensure data exists and has proper structure
        const formattedData = Array.isArray(data) ? data.map(item => ({
          date: item.date || '',
          count: item.count || 0
        })) : [];
        setWeeklyData(formattedData);
      })
      .catch(error => {
        console.error('Error fetching weekly data:', error);
        setWeeklyData([]);
      })
      .finally(() => setLoading(prev => ({...prev, weekly: false})));
  }, []);

  useEffect(() => {
    setLoading(prev => ({...prev, period: true}));
    fetch(`${API_BASE}/period?period=${period}`)
      .then(res => res.json())
      .then(data => setPeriodCount(data.count || 0))
      .catch(error => {
        console.error('Error fetching period data:', error);
        setPeriodCount(0);
      })
      .finally(() => setLoading(prev => ({...prev, period: false})));
  }, [period]);

  useEffect(() => {
    setLoading(prev => ({...prev, gender: true}));
    fetch(`${API_BASE}/gender`)
      .then(res => res.json())
      .then(data => {
        setGenderData([
          { name: 'Male', value: data.male || 0 },
          { name: 'Female', value: data.female || 0 },
          { name: 'Other', value: data.other || 0 }
        ]);
      })
      .catch(error => {
        console.error('Error fetching gender data:', error);
        setGenderData([]);
      })
      .finally(() => setLoading(prev => ({...prev, gender: false})));
  }, []);

  const COLORS = ['#3b82f6', '#ec4899', '#10b981'];
  const barColors = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Bar Chart with Today Highlighted */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Weekly Registrations</h2>
              <div className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                Last 7 days
              </div>
            </div>
            {loading.weekly ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart data...</div>
              </div>
            ) : weeklyData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.date === todayLabel ? '#10b981' : barColors[index % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Total Registration Period Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Registrations</h2>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="">All Time</option>
              </select>
            </div>
            {loading.period ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {periodCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {period === 'week' && 'in the last 7 days'}
                  {period === 'month' && 'in the last 30 days'}
                  {period === 'year' && 'in the last year'}
                  {period === '' && 'total registrations'}
                </div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, periodCount / 1000 * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution</h2>
            {loading.gender ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart data...</div>
              </div>
            ) : genderData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Users']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;