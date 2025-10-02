import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./componenets/Dashboard.jsx";
import SubmissionDetails from "./componenets/SubmissionDetails.jsx";
import Login from "./componenets/Login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submission/:id" element={<SubmissionDetails />} />
      </Routes>
      {/* ToastContainer should be outside Routes but inside BrowserRouter */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;
