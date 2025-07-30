// src/App.jsx
import React, { useEffect, useState, Fragment } from 'react';
import { Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes/index';
import './App.css';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  // Đầu tiên gọi API để lấy thông tin từ token
  axios
    .get("http://localhost:4000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      // Nếu là ADMIN và đang ở "/", chuyển hướng sang /admin
      if (res.data.user_type === "ADMIN" && window.location.pathname === "/") {
        navigate("/admin", { replace: true });
      }
    })
    .catch((err) => {
      // Nếu bị 403 (không phải USER), thử gọi API admin
      if (err.response?.status === 403) {
        axios
          .get("http://localhost:4000/api/users/admin-profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            if (res.data.user_type === "ADMIN") {
              navigate("/admin", { replace: true });
            }
          })
          .catch(() => {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          });
      } else {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    })
    .finally(() => setLoading(false));
};


  useEffect(() => {
    loadUser();

    // Lắng nghe login/logout
    const handleLoginStatusChange = () => {
      setLoading(true);
      loadUser();
    };
    window.addEventListener("loginStatusChanged", handleLoginStatusChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
    };
  }, []);

   useEffect(() => {
    if (!loading && user) {
      if (user.user_type === "ADMIN" && window.location.pathname === "/") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) return null;  // Có thể thêm spinner chờ load

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => {
          const Page = route.component;
          let Layout = route.layout || Fragment;
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
                isAuthorized ? (
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
