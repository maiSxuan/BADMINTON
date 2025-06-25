// src/routes/index.js

// Layout mặc định cho người dùng, có Header và Footer
import DefaultLayout from '../components/layouts/DefaultLayout'; 
// Layout cho trang quản trị, có AdminHeader và AdminSidebar
import AdminLayout from '../components/layouts/AdminLayout';   

// Thêm các trang vào đây
import Admin from '../pages/admin/Admin';
import HomePage from '../pages/customer/Home';
import AddProducts from '../pages/admin/AddProducts';
// Tạo các component giữ chỗ cho các trang public khác, tạo trang nào thì mình xóa dòng đó rồi import ở bên trên
const ProductsPage = () => <h1>Trang Sản Phẩm</h1>;
const SalePage = () => <h1>Trang Sale Off</h1>;
const FranchisePage = () => <h1>Trang Chính Sách Nhượng Quyền</h1>;
const AboutPage = () => <h1>Trang Giới Thiệu</h1>;
const ContactPage = () => <h1>Trang Liên Hệ</h1>;
const ReturnPolicyPage = () => <h1>Trang Chính Sách Đổi Trả</h1>;
const WarrantyPolicyPage = () => <h1>Trang Chính Sách Bảo Hành</h1>;
const HowToBuyPage = () => <h1>Trang Hướng Dẫn Mua Hàng</h1>;
const PaymentPage = () => <h1>Trang Hướng Dẫn Thanh Toán</h1>;


// Tạo các component giữ chỗ cho các trang admin khác
const UserListPage = () => <h1>Trang Danh Sách Người Dùng</h1>;
const LockAccountPage = () => <h1>Trang Khóa Tài Khoản</h1>;
const ResetPasswordPage = () => <h1>Trang Reset Mật Khẩu</h1>;
const AllOrdersPage = () => <h1>Trang Tất Cả Đơn Hàng</h1>;
const CancelledOrdersPage = () => <h1>Trang Đơn Hàng Đã Hủy</h1>;
const AllProductsPage = () => <h1>Trang Tất Cả Sản Phẩm</h1>;
const ChatManagementPage = () => <h1>Trang Quản Lý Chat</h1>;
const ReviewManagementPage = () => <h1>Trang Quản Lý Đánh Giá</h1>;
const RevenuePage = () => <h1>Trang Doanh Thu</h1>;
const BalancePage = () => <h1>Trang Số Dư Tài Khoản</h1>;

// Theo yêu cầu, tất cả sẽ được đặt trong publicRoutes để đơn giản hóa
const publicRoutes = [
  // --- Public Routes với DefaultLayout ---
  { path: '/', component: HomePage, layout: DefaultLayout },
  { path: '/products', component: ProductsPage, layout: DefaultLayout },
  { path: '/sale', component: SalePage, layout: DefaultLayout },
  { path: '/franchise', component: FranchisePage, layout: DefaultLayout },
  { path: '/about', component: AboutPage, layout: DefaultLayout },
  { path: '/contact', component: ContactPage, layout: DefaultLayout },
  { path: '/return', component: ReturnPolicyPage, layout: DefaultLayout },
  { path: '/warranty', component: WarrantyPolicyPage, layout: DefaultLayout },
  { path: '/how-to-buy', component: HowToBuyPage, layout: DefaultLayout },
  { path: '/payment', component: PaymentPage, layout: DefaultLayout },

  // --- Admin Routes với AdminLayout ---
  // Trang admin mặc định (dashboard)
  { path: '/admin', component: Admin, layout: AdminLayout }, 
  
  // Quản lý người dùng
  { path: '/admin/user-list', component: UserListPage, layout: AdminLayout },
  { path: '/admin/lock-account', component: LockAccountPage, layout: AdminLayout },
  { path:'/admin/reset-password', component: ResetPasswordPage, layout: AdminLayout },
  
  // Quản lý đơn hàng
  { path: '/admin/all-orders', component: AllOrdersPage, layout: AdminLayout },
  { path: '/admin/cancelled-orders', component: CancelledOrdersPage, layout: AdminLayout },

  // Quản lý sản phẩm
  { path: '/admin/all-products', component: AllProductsPage, layout: AdminLayout },
  { path: '/admin/add-product', component: AddProducts, layout: AdminLayout },

  // Chăm sóc khách hàng
  { path: '/admin/chat-management', component: ChatManagementPage, layout: AdminLayout },
  { path: '/admin/review-management', component: ReviewManagementPage, layout: AdminLayout },

  // Tài chính
  { path: '/admin/revenue', component: RevenuePage, layout: AdminLayout },
  { path: '/admin/balance', component: BalancePage, layout: AdminLayout },

  //  404 Not Found
  // { path: '*', component: NotFoundPage, layout: DefaultLayout }
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };