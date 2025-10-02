import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ✅ important for Tailwind
import { AllProvider } from "./AllContext/AllContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AllProvider>
      <App />
    </AllProvider>
  </React.StrictMode>
);
