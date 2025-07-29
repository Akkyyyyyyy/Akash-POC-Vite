import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Button } from './ui/button';

// const API_BASE = 'http://localhost:5000/user/dashboard';
const API_BASE = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE);

const GRANULARITIES = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
  { label: 'Yearly', value: 'year' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayLabel, setTodayLabel] = useState('');
  const [genderData, setGenderData] = useState([]);
  const [monthsData, setMonthsData] = useState([]);
  const [loading, setLoading] = useState({
    weekly: true,
    monthly: true,
    gender: true
  });
  // Add state for each chart's granularity
  const [weeklyGranularity, setWeeklyGranularity] = useState('week');
  const [totalGranularity, setTotalGranularity] = useState('month');
  const [genderGranularity, setGenderGranularity] = useState('month');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Refactor data fetching for weekly registrations
  useEffect(() => {
    setLoading(prev => ({ ...prev, weekly: true }));
    let url = '';
    if (weeklyGranularity === 'day') url = `${API_BASE}user/dashboard/period?period=day`;
    else if (weeklyGranularity === 'week') url = `${API_BASE}user/dashboard/period?period=week`;
    else if (weeklyGranularity === 'month') url = `${API_BASE}user/dashboard/period?period=month`;
    else if (weeklyGranularity === 'year') url = `${API_BASE}user/dashboard/period?period=year`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data)) {
          // Use the new backend response format
          const formattedData = data.data.map(item => ({
            date: item.label,
            count: item.count
          }));
          setWeeklyData(formattedData);
          
          // Set today label for highlighting (only for weekly view)
          if (weeklyGranularity === 'week') {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
            setTodayLabel(today);
          }
        } else {
          setWeeklyData([]);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setWeeklyData([]);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, weekly: false }));
      });
  }, [weeklyGranularity]);

  // Refactor data fetching for total registrations
  useEffect(() => {
    setLoading(prev => ({ ...prev, monthly: true }));
    let url = '';
    if (totalGranularity === 'day') url = `${API_BASE}user/dashboard/period?period=day`;
    else if (totalGranularity === 'week') url = `${API_BASE}user/dashboard/period?period=week`;
    else if (totalGranularity === 'month') url = `${API_BASE}user/dashboard/period?period=month`;
    else if (totalGranularity === 'year') url = `${API_BASE}user/dashboard/period?period=year`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data)) {
          // Use the new backend response format
          const formattedData = data.data.map(item => ({
            month: item.label,
            count: item.count
          }));
          setMonthsData(formattedData);
        } else {
          setMonthsData([]);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMonthsData([]);
      })
      .finally(() => setLoading(prev => ({ ...prev, monthly: false })));
  }, [totalGranularity]);

  // Refactor data fetching for gender distribution
  useEffect(() => {
    setLoading(prev => ({ ...prev, gender: true }));
    fetch(`${API_BASE}user/dashboard/gender`)
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
      .finally(() => setLoading(prev => ({ ...prev, gender: false })));
  }, [genderGranularity]);

  const COLORS = ['#3b82f6', '#ec4899', '#10b981'];
  const barColors = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {/* Weekly Registrations Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 col-span-2 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Registrations</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[120px]">{GRANULARITIES.find(g => g.value === weeklyGranularity).label}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {GRANULARITIES.map(g => (
                    <DropdownMenuItem key={g.value} onSelect={() => setWeeklyGranularity(g.value)}>{g.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
          {/* Total Registrations Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Registrations</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[120px]">{GRANULARITIES.find(g => g.value === totalGranularity).label}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {GRANULARITIES.map(g => (
                    <DropdownMenuItem key={g.value} onSelect={() => setTotalGranularity(g.value)}>{g.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {loading.monthly ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
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
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Gender Distribution Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Gender Distribution</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[120px]">{GRANULARITIES.find(g => g.value === genderGranularity).label}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {GRANULARITIES.map(g => (
                    <DropdownMenuItem key={g.value} onSelect={() => setGenderGranularity(g.value)}>{g.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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