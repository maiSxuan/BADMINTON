// src/routes/index.js

// Import các trang
import Home from '../pages/customer/Home';
import Admin from '../pages/admin/Admin';

// Import các layout
import DefaultLayout from '../components/layouts/DefaultLayout';
import AdminLayout from '../components/layouts/AdminLayout';

const publicRoutes = [
    { path: '/', component: Home, layout: DefaultLayout }, // <-- THÊM VÀO ĐÂY
    { path: '/admin', component: Admin, layout: AdminLayout }  // <-- VÀ Ở ĐÂY
];

// Bạn cũng có thể có các route không cần layout
// const publicRoutes = [
//     { path: '/', component: Home, layout: DefaultLayout },
//     { path: '/admin', component: Admin, layout: AdminLayout },
//     { path: '/login', component: LoginPage, layout: null } // Trang login không có layout
// ];


const privateRoutes = [];

export { publicRoutes, privateRoutes };