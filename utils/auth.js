// src/utils/auth.js

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersupersecretkey";

export function verifyToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}
