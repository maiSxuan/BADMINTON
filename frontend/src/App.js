import './App.css';
import CustomerLayout from './layouts/CustomerLayout';
// import AdminLayout from './layouts/AdminLayout';
// import ManagerLayout from './layouts/ManagerLayout';
function App() {
  // Tạm thời giả lập role để test layout
  const role = 'admin';  // Switch to 'customer' or 'manager' to test

  // if (role === 'admin') {
  //   return <AdminLayout />;
  // }
  // if (role === 'manager') {
  //   return <ManagerLayout />;
  // }
  return <CustomerLayout />;
}

export default App;
