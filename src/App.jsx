import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import User from "./components/User";
import LeftSidebar from "./components/LeftSidebar";

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<User />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
