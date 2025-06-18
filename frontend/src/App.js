import './App.css';
import Header from './components/customer/Header';
import Footer from './components/customer/Footer';
import Home from './pages/customer/Home';

function App() {
  return (
    <>
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </>
  );
}

export default App;
