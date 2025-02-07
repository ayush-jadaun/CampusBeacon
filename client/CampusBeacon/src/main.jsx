import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ResourcesPage from "./pages/ResourceHub.jsx";

  createRoot(document.getElementById("root")).render(
    <StrictMode>
    <App/>
    </StrictMode>
  );
