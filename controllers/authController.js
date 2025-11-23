import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const SECRET = process.env.JWT_SECRET || "MY_SUPER_SECRET"; // fallback if env not set

// Utility to parse JSON body
const getBody = req =>
  new Promise(resolve => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => resolve(JSON.parse(body || "{}")));
  });

// Utility to send error
const sendError = (res, message, code = 401) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: message }));
};

// ---------------- SIGNUP ----------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = await getBody(req);

    if (!name || !email || !password) {
      return sendError(res, "All fields required", 400);
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return sendError(res, "Email already registered", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "employee",
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User registered successfully", userId: user.id }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Signup failed", details: error.message }));
  }
};

// ---------------- LOGIN ----------------
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = await getBody(req);

    const user = await User.findOne({ where: { email } });
    if (!user) return sendError(res, "Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, "Invalid credentials");

    // Optional role check
    if (role && user.role !== role) {
      return sendError(res, `User is not an ${role}`, 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Login success", token, role: user.role }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Login failed", details: error.message }));
  }
};

// ---------------- GET PROFILE ----------------
export const getProfile = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return sendError(res, "No token", 401);

    const token = auth.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return sendError(res, "Invalid token", 401);
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) return sendError(res, "User not found", 404);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user }));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error", details: err.message }));
  }
};
