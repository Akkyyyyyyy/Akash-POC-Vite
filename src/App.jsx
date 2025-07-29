import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import User from "./components/User";
import LeftSidebar from "./components/LeftSidebar";
import { Toaster } from "./components/ui/sonner";
import ResetPassword from "./components/ResetPassword";

const MainLayout = () => (
  <div className="flex min-h-screen">
    <LeftSidebar />
    <main className="flex-1 p-4">
      <Outlet />
    </main>
    <Toaster/>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<><Login /><Toaster/></>} />
        <Route path="/signup" element={<><Signup /><Toaster/></> }/>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<User />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
