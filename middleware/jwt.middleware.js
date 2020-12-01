const { JwtService } = require("../services");

class JwtMiddleware {
  constructor() {}

  getUser(req, res, next) {
    try {
      const bearer = req.header("Authorization") || "";
      const token = bearer.split(" ")[1];
      const decoded = JwtService.decode(token);
      req.user = {
        id: decoded.payload.id,
      };
      return next();
    } catch (e) {
      return next();
    }
  }

  verify(req, res, next) {
    const bearer = req.header("Authorization") || "";
    const token = bearer.split(" ")[1];
    const valid = JwtService.verify(token);
    return valid ? next() : res.status(401).send({ error: "Unauthorized" });
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
        : res.status(403).send({ error: "Access Denied" });
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
        : res.status(403).send({ error: "Access Denied" });
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
        : res.status(403).send({ error: "Access Denied" });
    };
  }
}

module.exports = new JwtMiddleware();
