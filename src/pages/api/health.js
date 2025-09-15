// src/pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ status: 'ok' });
}
// This is a simple health check endpoint to verify that the API is running.