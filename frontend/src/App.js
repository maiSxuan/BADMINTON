// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Home from './pages/customer/Home'
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

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/customer/Home';
import CustomerRoutes from './routes/CustomerRoutes';  // Đường dẫn riêng cho Customer
import AdminRoutes from './routes/AdminRoutes';      // Đường dẫn riêng cho Admin
import './App.css';

function App() {
  return (
    <Routes>
      {/* Routes dành cho Customer */}
      <Route path="/customer/*" element={<CustomerRoutes />} />

      {/* Routes dành cho Admin */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Route mặc định */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;

//code cũ
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