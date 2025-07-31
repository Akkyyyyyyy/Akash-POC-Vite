import React, { memo, useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar'
import { LayoutDashboardIcon, LogOut, User, User2, UserCircle2, Users } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const LeftSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token);
        if (!token) navigate('/login');
      }, [navigate]);
    

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openDialog =(e)=> {
        e.preventDefault(); // Prevent default link navigation
        setIsDialogOpen(true);
    }

    const confirmLogout=()=> {
        handleLogout();
        setIsDialogOpen(false);
    }

    const cancelLogout=()=> {
        setIsDialogOpen(false);
    }

    const handleLogout = async () => {
        // e.preventDefault();
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

    const dashboardItems = [
        { label: 'Dashboard', icon: <LayoutDashboardIcon />, to: '/dashboard' },
        { label: 'Users', icon: <Users />, to: '/users' },
        { label: user?.name, icon: <UserCircle2 />, to: '/admin' },
        { label: 'Logout', icon: <LogOut />, to: '/logout', onClick: handleLogout },
    ]
    const normalItems = dashboardItems.slice(0, dashboardItems.length - 2);
    const lastItems = dashboardItems.slice(dashboardItems.length - 2); // last two items

    return (
        <SidebarProvider>
            <Sidebar className="min-h-screen bg-white border-r shadow-sm w-64">
                <SidebarHeader className="text-xl font-semibold px-6 py-4 border-b bg-gray-100">
                    Logo
                </SidebarHeader>

                <SidebarContent className="p-4 flex flex-col justify-between h-full">
                    {/* Normal menu items */}
                    <SidebarMenu className="space-y-2">
                        {normalItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild>
                                    {item.label === 'Logout' ? (
                                        <a
                                            href="/logout"
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-700 hover:bg-gray-100"
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </a>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-gray-200 text-black' : 'text-gray-700 hover:bg-gray-100'
                                                }`
                                            }
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>

                    {/* Render the last two items separately, e.g. at the bottom */}
                    <SidebarMenu className="space-y-2 mt-auto">
                        {lastItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild>
                                    {item.label === 'Logout' ? (
                                        <>
                                            <a
                                                href="/logout"
                                                onClick={openDialog}
                                                className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-700 hover:bg-gray-100"
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                {item.label}
                                            </a>

                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Confirm Logout</DialogTitle>
                                                    </DialogHeader>
                                                    <p>Are you sure you want to log out?</p>
                                                    <DialogFooter>
                                                        <button
                                                            onClick={cancelLogout}
                                                            className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={confirmLogout}
                                                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            Logout
                                                        </button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-gray-200 text-black' : 'text-gray-700 hover:bg-gray-100'
                                                }`
                                            }
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );

}

export default memo(LeftSidebar)