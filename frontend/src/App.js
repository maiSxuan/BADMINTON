// src/App.jsx

import React, { useEffect, Fragment } from 'react'; // Import Fragment
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes/index';
// Không cần import layout ở đây nữa vì đã có trong file routes
import './App.css';
//import { route } from '../../backend/routes/usersRouter';

function App() {


  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="App">
      <Routes>
        {publicRoutes.map((route) => {
          const Page = route.component;
          // Mặc định Layout là một thẻ rỗng (Fragment) nếu không được chỉ định
          // hoặc nếu layout được cố tình đặt là null
          let Layout = Fragment; 

          if (route.layout) {
            Layout = route.layout;
          }

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


        {privateRoutes.map((route) =>{
          const Page = route.component;
          const Layout = route.layout;
          const allowedRoles = route.allowedRoles || [];
          const isAuthorized = user && route.allowedRoles && route.allowedRoles.includes(user.user_type);

          return(
            <Route
              key = {route.path}
              path = {route.path}
              element={
                isAuthorized ? (
                  <Layout>
                    <Page />
                  </Layout>
                ) : user ? (
                  <Navigate to="/" replace /> //đăng nhập r nhưng sai role
                ) : (
                  <Navigate to="/" replace /> //chưa đăng nhập
                )
              }
            />
          )
        })}
      </Routes>
    </div>
  );
}


export default App;

//code cũ 2
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Home from './pages/customer/Home';
// import Admin from './pages/admin/Admin'
// import './App.css';

// function App() {
//   return (
//         <Routes>
//           {/* Thêm các path khác vào đây */}
//           <Route path="/" element={<Home />} />
//           <Route path="/admin" element={<Admin/>}/>
//         </Routes>
//   );
// }

// export default App;


//code cũ 1
// import './App.css';
// import Header from './components/customer/Header';
// import Footer from './components/customer/Footer';
// import Home from './pages/customer/Home';

// function App() {
//   return (
//     <>
//       <Header />
//       <main>
//         <Home />
//       </main>
//       <Footer />
//     </>
//   );
// }

// export default App;