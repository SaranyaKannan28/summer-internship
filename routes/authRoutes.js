import {
  registerUser,
  loginUser,
  getProfile
} from "../controllers/authController.js";

export const handleAuthRoutes = (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Always define this BEFORE using it
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split("/").filter(p => p);
  // Example: /api/auth/login → ["api", "auth", "login"]

  // -------------------------------
  //          AUTH ROUTES
  // -------------------------------

  // POST /api/auth/signup
  if (req.method === "POST" && pathParts[2] === "signup") {
    return registerUser(req, res);
  }

  // POST /api/auth/login
  if (req.method === "POST" && pathParts[2] === "login") {
    return loginUser(req, res);
  }

  // GET /api/auth/profile
  if (req.method === "GET" && pathParts[2] === "profile") {
    return getProfile(req, res);
  }

  // If no route matched
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Auth route not found" }));
};
