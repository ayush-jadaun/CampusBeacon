import ApiError from "../utils/apiError.js";

/*
=======================================================================
   Role middleware - require one of the given roles (after auth)
=======================================================================
*/
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (roles.some((role) => allowedRoles.includes(role))) {
      return next();
    }
    return next(
      new ApiError("You do not have permission to perform this action", 403)
    );
  };
};

export default requireRole;
