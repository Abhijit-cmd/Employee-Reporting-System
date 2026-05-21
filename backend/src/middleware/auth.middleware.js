const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  try {

    // GET TOKEN FROM HEADER
    const token = req.headers.authorization;

    // CHECK TOKEN
    if (!token) {
      return res.status(401).json({
        message: "Access denied"
      });
    }

    // VERIFY TOKEN
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // SAVE USER DATA
    req.user = verified;

    // NEXT FUNCTION
    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }

};

module.exports = authMiddleware;