// src/App.jsx
import React, { useEffect, useState, Fragment } from "react";
import { Routes, Route, Navigate, useNavigate,ScrollRestoration } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes/index";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectMessage, setRedirectMessage] = useState("");
  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        const adminRes = await fetch("http://localhost:4000/api/users/admin-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!adminRes.ok) throw new Error("Không thể lấy thông tin admin");
        const adminData = await adminRes.json();
        setUser(adminData);
        localStorage.setItem("user", JSON.stringify(adminData));
        if (adminData.user_type === "ADMIN") navigate("/admin", { replace: true });
      } else if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        if (data.user_type === "ADMIN" && window.location.pathname === "/")
          navigate("/admin", { replace: true });
      } else {
        throw new Error("Phiên đăng nhập không hợp lệ");
      }
    } catch {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    const handleLoginStatusChange = () => {
      setLoading(true);
      loadUser();
    };
    window.addEventListener("loginStatusChanged", handleLoginStatusChange);
    return () => window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
  }, []);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!loading) {
      const isAdminPath = window.location.pathname.startsWith("/admin");
      if (isAdminPath && (!user || user.user_type !== "ADMIN")) {
        setRedirectMessage("Bạn không có quyền truy cập");
        setTimeout(() => navigate("/", { replace: true }), 800);
      }
      if (user && user.user_type === "ADMIN" && window.location.pathname === "/") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Hiển thị toast khi có thông báo
  useEffect(() => {
    if (redirectMessage) {
      toast.error(redirectMessage);
      setRedirectMessage(""); // Reset tránh lặp
    }
  }, [redirectMessage]);

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        {publicRoutes.map((route) => {
          const Page = route.component;
          const Layout = route.layout || Fragment;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}

        {/* Private routes */}
        {privateRoutes.map((route) => {
          const Page = route.component;
          const Layout = route.layout || Fragment;
          const allowedRoles = route.allowedRoles || [];
          const isAuthorized =
            user && allowedRoles.length > 0 && allowedRoles.includes(user.user_type);

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                loading ? (
                  <div className="loading">Đang tải...</div>
                ) : isAuthorized ? (
                  <Layout>
                    <Page />
                  </Layout>
                ) : user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          );
        })}
      </Routes>
    </div>
  );
}

export default App;
