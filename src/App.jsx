import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import User from "./components/User";
import LeftSidebar from "./components/LeftSidebar";
import { Toaster } from "./components/ui/sonner";
import ResetPassword from "./components/ResetPassword";
import Admin from "./components/admin";
import Home from "./components/Home";

const MainLayout = () => (
  <div className="flex min-h-screen">
    <LeftSidebar />
    <main className="flex-1 p-4">
      <Outlet />
    </main>
  
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<><Login /><Toaster position="top-right"/></>} />
        <Route path="/signup" element={<><Signup /><Toaster position="top-right"/></> }/>
        <Route path="/reset-password/:token" element={<><ResetPassword/><Toaster position="top-right"/></>}/>
        <Route path="/home" element={<Home/>}/>

       
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<><Dashboard /></>} />
          <Route path="/users" element={<><User /><Toaster position="top-right"/></>} />
          <Route path="/admin" element={<><Admin/></>}/>
         
        </Route>
        <Route path="*" element={<div className="flex justify-center items-center h-screen text-2xl font-bold">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
