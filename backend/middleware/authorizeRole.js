/**
 * Role-Based Authorization Middleware
 * Restricts access to routes based on user role(s).
 *
 * Supported Usage:
 *   1. Single Role (Admin only):
 *      router.get("/admin/users", authenticateToken, authorizeRole("admin"), handler);
 *
 *   2. Single Role (Student only):
 *      router.get("/student/exams", authenticateToken, authorizeRole("student"), handler);
 *
 *   3. Multiple Roles (Admin or Teacher):
 *      router.get("/manage/questions", authenticateToken, authorizeRole("admin", "teacher"), handler);
 *      // or with array:
 *      router.get("/manage/questions", authenticateToken, authorizeRole(["admin", "teacher"]), handler);
 */
function authorizeRole(...allowedRoles) {
    // Flatten arguments to support both authorizeRole("admin", "teacher") and authorizeRole(["admin", "teacher"])
    const roles = allowedRoles.flat().map(role => String(role).toLowerCase().trim());

    return (req, res, next) => {
        // 1. Verify user object and role existence from JWT authentication
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Unauthorized: User role not found in authentication token. Please log in again.",
            });
        }

        const userRole = String(req.user.role).toLowerCase().trim();

        // 2. Check if the authenticated user's role is in the list of allowed roles
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: `Forbidden: Access denied. Required role(s): [${roles.join(", ")}]. Your current role is '${req.user.role}'.`,
            });
        }

        // 3. User is authorized, proceed to the route controller
        next();
    };
}

module.exports = {
    authorizeRole,
    authorizeRoles: authorizeRole, // alias
};
