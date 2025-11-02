import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Download from './pages/Download';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/download/:id" element={<Download />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="bg-dark text-light py-4 mt-5">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5>FileShare</h5>
                <p className="mb-0">
                  Secure file sharing made simple. Upload, share, and manage your files with ease.
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <h6>Features</h6>
                <ul className="list-unstyled mb-0">
                  <li>Secure file uploads</li>
                  <li>Automatic expiration</li>
                  <li>Download tracking</li>
                  <li>Anonymous sharing</li>
                </ul>
              </div>
            </div>
            <hr className="my-3" />
            <div className="row">
              <div className="col-12 text-center">
                <p className="mb-0">
                  &copy; {new Date().getFullYear()} FileShare. Built with React and Node.js.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
