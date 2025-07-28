import React, { memo } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar'
import { LayoutDashboardIcon, LogOut, User2 } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const LeftSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/user/logout', {
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
        { label: 'Users', icon: <User2 />, to: '/users' },
        { label: 'Logout', icon: <LogOut />, to: '/logout', onClick: handleLogout }
    ]
    return (
        <SidebarProvider>
            <Sidebar className="min-h-screen bg-white border-r shadow-sm w-64">
                <SidebarHeader className="text-xl font-semibold px-6 py-4 border-b bg-gray-100">
                    Logo
                </SidebarHeader>

                <SidebarContent className="p-4">
                    <SidebarMenu className="space-y-2">
                        {dashboardItems.map((item) => {
                            const isActive = location.pathname === item.to;

                            return (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        {item.label === 'Logout' ? (
                                            <a
                                                href="/logout"
                                                onClick={handleLogout}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-700 hover:bg-gray-100`}
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
                            );
                        })}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}

export default memo(LeftSidebar)