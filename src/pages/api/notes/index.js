import { PrismaClient } from '@prisma/client';
import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const user = verifyToken(req);
console.log("TOKEN:", req.headers.authorization); // Debug
console.log("USER:", user); // Debug


  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    const isAdmin = user.role === "Admin";
    const whereClause = isAdmin
      ? { tenantId: user.tenantId }
      : { tenantId: user.tenantId, userId: user.userId };
    try {
      const notes = await prisma.note.findMany({
        where: whereClause,
        orderBy: { id: 'desc' }
      });
      return res.status(200).json(notes);
    } catch (err) {
      console.error("PRISMA ERROR:", err);
      return res.status(500).json({ error: "Database error", detail: err.message });
    }
  }

  if (req.method === 'POST') {
    const { title, content } = req.body;
    console.log("BODY:", req.body);     // Debug

    if (user.plan === "free") {
      const noteCount = await prisma.note.count({
        where: { tenantId: user.tenantId }
      });
      if (noteCount >= 5) {
        return res.status(403).json({ error: "Free plan note limit reached! Upgrade for more notes." });
      }
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    try {
      const note = await prisma.note.create({
        data: {
          title,
          content,
          userId: user.userId,
          tenantId: user.tenantId
        }
      });
      return res.status(201).json(note);
    } catch (err) {
      console.error("PRISMA ERROR:", err);
      return res.status(500).json({ error: "Database error", detail: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
