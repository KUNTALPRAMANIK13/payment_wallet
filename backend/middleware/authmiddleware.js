import jwt from "jsonwebtoken";
const authmiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token format
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Server misconfigured: JWT secret not set" });
  }
  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.userId = decoded.id;
    next();
  });
};

export default authmiddleware;
