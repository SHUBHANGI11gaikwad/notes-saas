import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersupersecretkey";

export default async function handler(req, res) {
  console.log(req);
  console.log(res);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
   'https://notes-saas-frontend-three.vercel.app'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Always respond to preflight OPTIONS with 200 and CORS headers
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only block disallowed origins for actual POST requests
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Use POST" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }



  // Get tenant info (assuming user.tenantId exists)
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });

  // --- JWT Token payload with role & plan ---
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,                 // user.role from DB
      tenantId: user.tenantId,
      plan: tenant.plan,               // tenant.plan from tenant DB
      tenantSlug: tenant.slug || ""    // optional: for frontend routing
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );




  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: tenant.slug,
      plan: tenant.plan
    }
  });
}