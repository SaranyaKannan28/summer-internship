import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const SECRET = "MY_SUPER_SECRET"; // Move to .env later

// Parse JSON body manually
const getBody = req =>
  new Promise(resolve => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => resolve(JSON.parse(body || "{}")));
  });

// ---------- SIGNUP ----------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = await getBody(req);

    if (!name || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "All fields required" }));
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email already registered" }));
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "User registered successfully",
      userId: user.id
    }));

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Signup failed", details: error.message }));
  }
};

// ---------- LOGIN ----------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = await getBody(req);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Login success", token }));

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Login failed", details: error.message }));
  }
};
