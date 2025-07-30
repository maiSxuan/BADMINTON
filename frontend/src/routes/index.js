// src/routes/index.js

// Layout mặc định cho người dùng, có Header và Footer, Sidebar, Breadcrumb
import DefaultLayout from "../layouts/DefaultLayout";
// Layot cho cart, đơn hàng,... 
import HeaderFooterLayout from "../layouts/HeaderFooterLayout";
// Layout cho trang quản trị, có AdminHeader và AdminSidebar
import AdminLayout from "../layouts/AdminLayout";

// Thêm các trang vào đây
import AdminHome from "../pages/admin/AdminHome";
import HomePage from "../pages/customer/Home";
import About from "../pages/customer/About";
import Contact from "../pages/customer/Contact"
import AddProducts from "../pages/admin/AddProducts";

//import ProductPage from "../pages/customer/ProductPage";
//import RacketPage from "../pages/customer/Product/Racket";
//import ShoePage from "../pages/customer/Product/Shoe";
import ProductPage from "../pages/customer/ProductPage";
// import TestUploadPage from "../pages/testupload";
//import BaloPage from "../pages/customer/Product/Balo";
import UserListPage from "../pages/admin/UserList";
import AddPromotionPage from "../pages/admin/AddPromotion";
import RevenuePage from "../pages/admin/RevenuePage";
import BalancePage from "../pages/admin/BalancePage";
import PromotionListPage from "../pages/admin/PromotionList";
import FranchisePolicy from "../pages/customer/FranchisePolicy";
import OrderManagement from "../pages/admin/OrderManagement";
import CancelledOrders from "../pages/admin/CancelledOrdersPage";
import AllProducts from "../pages/admin/AllProducts";
import SaleOffPage from "../pages/customer/Saleoff";
import ReturnRefundForm from "../pages/customer/RefundPage";
import ForgotPasswordStep1 from "../pages/customer/ForgotPassword1";
import ForgotPasswordStep2 from "../pages/customer/ForgotPassword2";
import Login from "../pages/customer/Login";
import Registration from "../pages/customer/Registration";
import ProfilePage from "../pages/customer/ProfilePage";
import ShippingInfo from "../pages/customer/ShippingInfo";
import CartPage from "../pages/customer/Cart";
import OrderHistoryPage from "../pages/customer/OrderHistory";
import ProductDetailPage from "../pages/customer/ProductDetail";
import PurchasePage from "../pages/customer/Purchase";
// Tạo các component giữ chỗ cho các trang public khác, tạo trang nào thì mình xóa dòng đó rồi import ở bên trên
const ProductsPage = ProductPage
const FranchisePage = FranchisePolicy;
const AboutPage = About;
const ContactPage = Contact;
const ReturnPolicyPage = () => <h1>Trang Chính Sách Đổi Trả</h1>;
const WarrantyPolicyPage = () => <h1>Trang Chính Sách Bảo Hành</h1>;
const HowToBuyPage = () => <h1>Trang Hướng Dẫn Mua Hàng</h1>;
const PaymentPage = () => <h1>Trang Hướng Dẫn Thanh Toán</h1>;

// Tạo các component giữ chỗ cho các trang admin khác
const LockAccountPage = () => <h1>Trang Khóa Tài Khoản</h1>;
const ResetPasswordPage = () => <h1>Trang Reset Mật Khẩu</h1>;
const ChatManagementPage = () => <h1>Trang Quản Lý Chat</h1>;
const ReviewManagementPage = () => <h1>Trang Quản Lý Đánh Giá</h1>;



// Theo yêu cầu, tất cả sẽ được đặt trong publicRoutes để đơn giản hóa
const publicRoutes = [
  // --- Public Routes với DefaultLayout ---
  { path: "/", component: HomePage, layout: DefaultLayout },

  {
    path: "/products",
    component: ProductsPage,
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={false}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Sản phẩm" },
        ]}
      />
    ),
  },

  {
    path: "/sale",
    component: SaleOffPage,
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={false}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Sale off" },
        ]}
      />
    )
  },

  {
    path: "/franchise",
    component: FranchisePage,
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={true}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Chính sách nhượng quyền" },
        ]}
      />
    )
  },

  {
    path: "/about",
    component: AboutPage,
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={true}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Giới thiệu" },
        ]}
      />
    )
  },
  {
    path: "/contact",
    component: ContactPage,
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={false}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Liên hệ" },
        ]}
      />
    )
  },
  { path: "/account/profile", component: ProfilePage, layout: DefaultLayout},
  { path: "/return", component: ReturnPolicyPage, layout: DefaultLayout },
  { path: "/warranty", component: WarrantyPolicyPage, layout: DefaultLayout },
  { path: "/how-to-buy", component: HowToBuyPage, layout: DefaultLayout },
  { path: "/purchase", component: PurchasePage, layout: DefaultLayout},

  { path: "/payment", component: PaymentPage, layout: DefaultLayout },
  { path: "/return-refund", 
    component: ReturnRefundForm, 
    layout: (props) => (
      <DefaultLayout
        {...props}
        showSidebar={false}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Tra cứu", path: "/" }, //sua path
          { label: "Lịch sử mua hàng", path: "/order-history" }, //sua path
          { label: "Yêu cầu đổi trả/hoàn tiền" },
        ]}
      />
    ) },
  { path: "/forgot-password", component: ForgotPasswordStep1, layout: DefaultLayout },
  { path: "/recover-password", component: ForgotPasswordStep2, layout: DefaultLayout },
  { path: "/login", component: Login},
  { path: "/registration", component: Registration},
  { path: "/registration-shipping-info", component: ShippingInfo, layout: DefaultLayout},
  {path: "/cart", component: CartPage, layout: HeaderFooterLayout},
  {path: "/order-history", component: OrderHistoryPage, layout:HeaderFooterLayout},
  {path: "/products/:slug",component: ProductDetailPage, layout: DefaultLayout},
 

  // --- Admin Routes với AdminLayout ---
  // Trang admin mặc định (dashboard)
  { path: "/admin", component: AdminHome, layout: AdminLayout },
    
  // Quản lý người dùng
  { path: "/admin/user-list", component: UserListPage, layout: AdminLayout },
  {
    path: "/admin/lock-account",
    component: LockAccountPage,
    layout: AdminLayout,
  },
  {
    path: "/admin/reset-password",
    component: ResetPasswordPage,
    layout: AdminLayout,
  },

  // Quản lý đơn hàng
  { path: "/admin/all-orders", component: OrderManagement, layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Quản lý đơn hàng", path: "/admin" },
      { label: "Tất cả đơn hàng", path: "/admin/all-orders" },
    ]}
  />
  )},

  {
    path: "/admin/cancelled-orders",
    component: CancelledOrders,
    layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Quản lý đơn hàng", path: "/admin" },
      { label: "Đơn hủy", path: "/admin/cancelled-orders" },
    ]}
  />
  )
  },

  // Quản lý sản phẩm
  {
    path: "/admin/all-products",
    component: AllProducts,
    layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Quản lý sản phẩm", path: "/admin" },
      { label: "Tất cả sản phẩm", path: "/admin/all-products" },
    ]}
  />
  )
  },
  { path: "/admin/add-product", component: AddProducts, layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Quản lý sản phẩm", path: "/admin" },
      { label: "Thêm sản phẩm", path: "/admin/add-products" },
    ]}
  />
  ) },

  // Chăm sóc khách hàng
  {
    path: "/admin/chat-management",
    component: ChatManagementPage,
    layout: AdminLayout,
  },
  {
    path: "/admin/review-management",
    component: ReviewManagementPage,
    layout: AdminLayout,
  },

  // Tài chính
  { path: "/admin/revenue", component: RevenuePage, layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Tài chính", path: "/admin" },
      { label: "Doanh thu", path: "/admin/revenue" },
    ]}
  />
  ) },
  { path: "/admin/balance", component: BalancePage, layout: (props) => (
  <AdminLayout
    {...props}
    breadcrumbItems={[
      { label: "Trang chủ", path: "/admin" },
      { label: "Tài chính", path: "/admin" },
      { label: "Số dư tài khoản", path: "/admin/balance" },
    ]}
  />
  ) },

  //Khuyến Mãi
  { path: "/admin/add-promotion", component: AddPromotionPage, layout: AdminLayout },
  { path: "/admin/manage-promotion", component: PromotionListPage, layout: AdminLayout },
  

  // {path: "/test", component: TestUploadPage},
  //  404 Not Found
  // { path: '*', component: NotFoundPage, layout: DefaultLayout }
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };