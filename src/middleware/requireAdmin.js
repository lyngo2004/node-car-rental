const requireAdmin = (req, res, next) => {
  // auth middleware đã gắn req.user rồi
  if (!req.user || req.user.role !== "Employee") {
    return res.status(403).json({
      EC: 1,
      EM: "Admin permission required",
      DT: ""
    });
  }
  next();
};

module.exports = requireAdmin;