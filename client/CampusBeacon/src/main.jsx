import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CollegeEateries from "./pages/eatries.jsx";


  createRoot(document.getElementById("root")).render(
    <StrictMode>
    {/* <App/> */}
    <CollegeEateries />
    </StrictMode>
  );
