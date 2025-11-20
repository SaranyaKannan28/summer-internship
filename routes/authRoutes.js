import {
  registerUser,
  loginUser
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

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split("/").filter(p => p); 
  // ['api', 'auth', 'login'] or ['api', 'auth', 'signup']

  // POST /api/auth/signup
  if (req.method === "POST" && pathParts[2] === "signup") {
    return registerUser(req, res);
  }

  // POST /api/auth/login
  if (req.method === "POST" && pathParts[2] === "login") {
    return loginUser(req, res);
  }

  // Unknown route
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Auth route not found" }));
};
