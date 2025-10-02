const adminAuth = (req, res, next) => {
  // In a real app, you'd have proper admin authentication
  // For now, we'll use a simple API key or token check
  const adminToken = req.headers["x-admin-token"] || req.query.adminToken;

  // In production, use environment variables and proper authentication
  const validToken = process.env.ADMIN_TOKEN;

  if (!adminToken || adminToken !== validToken) {
    return res.status(401).json({
      error: "Unauthorized: Admin access required",
    });
  }

  next();
};

export default adminAuth;
