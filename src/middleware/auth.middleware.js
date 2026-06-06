const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {

    let token = null;

    // First check cookies (primary method)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

   
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

  console.error(error);

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Session expired. Please login again."
    });
  }

  return res.status(401).json({
    message: "Invalid token"
  });

}
};

module.exports = authMiddleware;
