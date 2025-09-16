import { PrismaClient } from '@prisma/client';
import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
   const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://notes-saas-frontend-three.vercel.app'
];
 
res.setHeader('Access-Control-Allow-Origin', origin);
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();  // Just return OK
    return;
  }


  const user = verifyToken(req);
  console.log("TOKEN:", req.headers.authorization); // Debug
  console.log("USER:", user); // Debug

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const noteId = Number(req.query.id);
  const isAdmin = user.role==="Admin";

  if (req.method === 'GET') {
    const note = await prisma.note.findFirst({
      where: { id: noteId, tenantId: user.tenantId }
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    return res.status(200).json(note);
  }

  if (req.method === 'PUT') {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const whereClause = isAdmin
      ? { id: noteId, tenantId: user.tenantId }
      : { id: noteId, tenantId: user.tenantId, userId: user.userId };

    // Note sirf owner (ya admin role, agar logic dalana hai) ही update कर सकता है
    const updated = await prisma.note.updateMany({
      where: { id: noteId, tenantId: user.tenantId, userId: user.userId },
      data: { title, content }
    });
    if (updated.count === 0) {
      return res.status(403).json({ error: "Not allowed or note not found" });
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
     const whereClause = isAdmin
      ? { id: noteId, tenantId: user.tenantId }
      : { id: noteId, tenantId: user.tenantId, userId: user.userId };
      
    try {
      const deleted = await prisma.note.deleteMany({
        where: {
          id: noteId,
          tenantId: user.tenantId,
          userId: user.userId
        }
      });
      if (deleted.count === 0) {
        return res.status(403).json({ error: "Not allowed or note not found" });
      }
      return res.status(204).end();
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Delete failed", detail: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
