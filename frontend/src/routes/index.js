// src/routes/index.js

// Layout mặc định cho người dùng, có Header và Footer
import DefaultLayout from "../components/layouts/DefaultLayout";
// Layout cho trang quản trị, có AdminHeader và AdminSidebar
import AdminLayout from "../components/layouts/AdminLayout";

// Thêm các trang vào đây
import AdminHome from "../pages/admin/AdminHome";
import HomePage from "../pages/customer/Home";
import About from "../pages/customer/About";
import Contact from "../pages/customer/Contact"
import AddProducts from "../pages/admin/AddProducts";
// Tạo các component giữ chỗ cho các trang public khác, tạo trang nào thì mình xóa dòng đó rồi import ở bên trên
const ProductsPage = BaloPage;
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
  { path: "/return", component: ReturnPolicyPage, layout: DefaultLayout },
  { path: "/warranty", component: WarrantyPolicyPage, layout: DefaultLayout },
  { path: "/how-to-buy", component: HowToBuyPage, layout: DefaultLayout },
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
          { label: "Lịch sử mua hàng", path: "/" }, //sua path
          { label: "Yêu cầu đổi trả/hoàn tiền" },
        ]}
      />
    ) },
  { path: "/forgot-password", component: ForgotPasswordStep1, layout: DefaultLayout },
  { path: "/recover-password", component: ForgotPasswordStep2, layout: DefaultLayout },
  { path: "/login", component: Login},
  { path: "/registration", component: Registration},

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
  { path: "/admin/all-orders", component: OrderManagement, layout: AdminLayout },
  {
    path: "/admin/cancelled-orders",
    component: CancelledOrders,
    layout: AdminLayout,
  },

  // Quản lý sản phẩm
  {
    path: "/admin/all-products",
    component: AllProducts,
    layout: AdminLayout,
  },
  { path: "/admin/add-product", component: AddProducts, layout: AdminLayout },

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
  { path: "/admin/revenue", component: RevenuePage, layout: AdminLayout },
  { path: "/admin/balance", component: BalancePage, layout: AdminLayout },

  //Khuyến Mãi
  { path: "/admin/add-promotion", component: AddPromotionPage, layout: AdminLayout },
  { path: "/admin/manage-promotion", component: PromotionListPage, layout: AdminLayout },
  //  404 Not Found
  // { path: '*', component: NotFoundPage, layout: DefaultLayout }
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
