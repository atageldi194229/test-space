const { JwtService } = require("../services");
const ErrorResponse = require("../utils/errorResponse");

class JwtMiddleware {
  constructor() {}

  getUser(req, res, next) {
    try {
      const bearer = req.header("Authorization") || "";
      const token = bearer.split(" ")[1];
      const decoded = JwtService.decode(token);
      req.user = {
        id: decoded.payload.id,
        active: decoded.payload.active,
      };
      return next();
    } catch (e) {
      return next();
    }
  }

  isUserActive(req, res, next) {
    if (req.user && req.user.active) return next();
    return next(new ErrorResponse("User is not verified", 3, 402));
  }

  verify(req, res, next) {
    const bearer = req.header("Authorization") || "";
    const token = bearer.split(" ")[1];
    const valid = JwtService.verify(token);
    return valid ? next() : next(new ErrorResponse("Unauthorized", 1, 401));
  }

  hasRole(role) {
    return (req, res, next) => {
      const bearer = req.header("Authorization") || "";
      const token = bearer.split(" ")[1];
      const decoded = JwtService.decode(token);
      const foundRole = decoded.payload.role === role;
      // console.Log(decoded, foundRole);
      return foundRole
        ? next()
        : next(new ErrorResponse("Access Denied", 2, 403));
    };
  }

  hasAllRoles(roles) {
    return (req, res, next) => {
      const bearer = req.header("Authorization") || "";
      const token = bearer.split(" ")[1];
      const decoded = JwtService.decode(token);
      const foundAllRoles = roles.every((e) =>
        decoded.payload.roles.find((i) => i.role === e)
      );
      return foundAllRoles
        ? next()
        : next(new ErrorResponse("Access Denied", 2, 403));
    };
  }

  hasAnyRole(roles) {
    return (req, res, next) => {
      const bearer = req.header("Authorization") || "";
      const token = bearer.split(" ")[1];
      const decoded = JwtService.decode(token);
      const foundAnyRole = roles.some((e) => e === decoded.payload.role);
      return foundAnyRole
        ? next()
        : next(new ErrorResponse("Access Denied", 2, 403));
    };
  }
}

module.exports = new JwtMiddleware();
