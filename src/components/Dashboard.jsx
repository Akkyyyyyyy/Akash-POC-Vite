import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Users, TrendingUp, PieChart as PieChartIcon, Calendar, Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  const [weeklyGranularity, setWeeklyGranularity] = useState('day');
  const [totalGranularity, setTotalGranularity] = useState('day');
  const [genderGranularity, setGenderGranularity] = useState('day');

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
          const formattedData = data.data.map(item => ({
            date: item.label,
            count: item.count
          }));
          setWeeklyData(formattedData);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const barColors = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6'];

  // Calculate total users for stats cards
  const totalUsers = genderData.reduce((sum, item) => sum + item.value, 0);
  const totalRegistrations = weeklyData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-2 bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">Monitor your user analytics and insights</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Registrations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalRegistrations}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  This period
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{Math.floor(totalUsers * 0.85)}</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  85% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">+24%</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registrations Chart */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Registrations</h2>
                <p className="text-sm text-gray-600 mt-1">Track new user signups over time</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white border-gray-200 hover:bg-gray-50">
                    {GRANULARITIES.find(g => g.value === weeklyGranularity).label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  {GRANULARITIES.map(g => (
                    <DropdownMenuItem key={g.value} onSelect={() => setWeeklyGranularity(g.value)}>
                      {g.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {loading.weekly ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  Loading chart data...
                </div>
              </div>
            ) : weeklyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill="#3b82f6"
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

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gender Distribution</h2>
                <p className="text-sm text-gray-600 mt-1">User demographics breakdown</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            {loading.gender ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  Loading chart data...
                </div>
              </div>
            ) : genderData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    label={({ name, value, percent }) =>
                      value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : null
                    }
                    labelLine={false}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Users']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Total Registrations Line Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registration Trends</h2>
              <p className="text-sm text-gray-600 mt-1">Cumulative user growth over time</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white border-gray-200 hover:bg-gray-50">
                  {GRANULARITIES.find(g => g.value === totalGranularity).label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {GRANULARITIES.map(g => (
                  <DropdownMenuItem key={g.value} onSelect={() => setTotalGranularity(g.value)}>
                    {g.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {loading.monthly ? (
            <div className="h-80 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                Loading chart data...
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;