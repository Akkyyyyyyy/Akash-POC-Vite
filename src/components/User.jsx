import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Delete, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import UpdateDialog from './updateDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const User = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    verified: '',
    date: '', // new: date filter (today, yesterday, week, month, custom)
    customDateRange: { from: '', to: '' }, // for custom range
    age: '', // new: age filter (single or range)
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [viewOrEdit, setViewOrEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem('token');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' }); // sorting state

  const openUpdateDialog = (userId, operation) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
    setViewOrEdit(operation);
  };

  const closeUpdateDialog = () => {
    setIsDialogOpen(false);
    setSelectedUserId(null);
    setViewOrEdit(null);
  };

  const openDeleteConfirm = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteUserId(null);
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

  const fetchUsers = async (page = 1, search = '', gender = '', verified = '', date = '', customDateRange = {}, age = '', sort = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(gender && { gender }),
        ...(verified !== '' && { verified }),
        ...(date && { date }),
        ...(date === 'custom' && customDateRange.from && customDateRange.to && { from: customDateRange.from, to: customDateRange.to }),
        ...(age && { age }),
        ...(sort.key && { sortBy: sort.key, sortOrder: sort.direction })
      });
      const response = await fetch(`${API_BASE}user/users?${params}`);
      const data = await response.json();
      if (data.users) {
        const formattedData = data.users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt).toLocaleDateString('en-CA'),
          dob: calculateAge(user.dob),
        }));
        setUserData(formattedData);
        setPagination(data.pagination);
      } else {
        setUserData([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(
      pagination.currentPage,
      searchTerm,
      filters.gender,
      filters.verified,
      filters.date,
      filters.customDateRange,
      filters.age,
      sortConfig
    );
  }, [pagination.currentPage, searchTerm, filters, sortConfig]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDateFilterChange = (value) => {
    setFilters(prev => ({ ...prev, date: value, customDateRange: { from: '', to: '' } }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCustomDateRangeChange = (from, to) => {
    setFilters(prev => ({ ...prev, date: 'custom', customDateRange: { from, to } }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAgeFilterChange = (value) => {
    setFilters(prev => ({ ...prev, age: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ gender: '', verified: '', date: '', customDateRange: { from: '', to: '' }, age: '' });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (pageNum) => {
    setPagination(prev => ({ ...prev, currentPage: pageNum }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  
  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}user/delete/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        toast.success('User deleted successfully');
        closeDeleteConfirm();
        // Refresh the current page
        fetchUsers(pagination.currentPage, searchTerm, filters.gender, filters.verified);
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = () => {
    closeUpdateDialog();
    // Refresh data after dialog closes (in case of updates)
    fetchUsers(pagination.currentPage, searchTerm, filters.gender, filters.verified);
  };

  return (
    <div className="p-2 bg-white  ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
        {/* <Button 
          onClick={() => openUpdateDialog(null, 'create')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button> */}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name, email or phone number"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Date Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Date
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleDateFilterChange('today')}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDateFilterChange('yesterday')}>Yesterday</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDateFilterChange('week')}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDateFilterChange('month')}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDateFilterChange('custom')}>Custom Range</DropdownMenuItem>
            {filters.date === 'custom' && (
              <div className="flex flex-col gap-2 p-2">
                <label className="text-xs">From</label>
                <Input type="date" value={filters.customDateRange.from} onChange={e => handleCustomDateRangeChange(e.target.value, filters.customDateRange.to)} />
                <label className="text-xs">To</label>
                <Input type="date" value={filters.customDateRange.to} onChange={e => handleCustomDateRangeChange(filters.customDateRange.from, e.target.value)} />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Today Quick Filter */}
        <Button variant={filters.date === 'today' ? 'default' : 'outline'} onClick={() => handleDateFilterChange('today')}>Today</Button>
        {/* Age Filter */}
        <Input
          type="text"
          placeholder="Age or Age Range (e.g. 25 or 20-30)"
          value={filters.age}
          onChange={e => handleAgeFilterChange(e.target.value)}
          className="w-36"
        />
        {/* Gender Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">Gender</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleFilterChange('gender', '')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('gender', 'male')}>Male</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('gender', 'female')}>Female</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('gender', 'other')}>Other</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Verified Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">Verified</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleFilterChange('verified', '')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('verified', 'true')}>Verified</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('verified', 'false')}>Unverified</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Clear Filters Button */}
        <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading users...</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead onClick={() => handleSort('username')} className="cursor-pointer select-none">
                  Name {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer select-none">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('phone')} className="cursor-pointer select-none">
                  Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('dob')} className="cursor-pointer select-none">
                  Age {sortConfig.key === 'dob' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('gender')} className="cursor-pointer select-none">
                  Gender {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('verified')} className="cursor-pointer select-none">
                  Status {sortConfig.key === 'verified' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer select-none">
                  Created {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    {searchTerm || filters.gender || filters.verified !== '' 
                      ? 'No users found matching your criteria.' 
                      : 'No users found.'}
                  </TableCell>
                </TableRow>
              ) : (
                userData.map((user, i) => (
                  <TableRow key={user._id}>
                    <TableCell>{(pagination.currentPage - 1) * pagination.limit + i + 1}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.countryCode} {user.phone}</TableCell>
                    <TableCell>{user.dob}</TableCell>
                    <TableCell className="capitalize">{user.gender}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openUpdateDialog(user._id, 'view')} 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => openUpdateDialog(user._id, 'edit')} 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => openDeleteConfirm(user._id)}
                          size="sm" 
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                {pagination.totalUsers} users
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === pagination.currentPage;
                    
                    // Show only current page and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === pagination.currentPage - 2 ||
                      pageNum === pagination.currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2 py-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog for Create/Edit/View */}
      {isDialogOpen && (
        <UpdateDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          userId={selectedUserId}
          operation={viewOrEdit}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={closeDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default User;
