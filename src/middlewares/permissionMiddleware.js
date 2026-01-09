const checkPermission = (requiredPermission, scope = "BUSINESS") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user.role_name;
        const userPermissions = req.user.permissions || [];

        const hasRequiredPermission = (perm) => {
            if (Array.isArray(perm)) {
                return perm.some(p => userPermissions.includes(p));
            }
            return userPermissions.includes(perm);
        };

        if (scope === "PLATFORM") {
            const isAuthorized = hasRequiredPermission(requiredPermission) || role === 'super_admin';
            if (!isAuthorized) {
                return res.status(403).json({ message: "Platform permission denied" });
            }
            return next();
        }

        if (scope === "BUSINESS") {
            if (!req.user.business_id) {
                return res.status(403).json({
                    message: "Security Restriction: Platform administrators cannot access tenant data"
                });
            }

            const isAuthorized = hasRequiredPermission(requiredPermission);

            if (!isAuthorized) {
                return res.status(403).json({ message: "Business permission denied" });
            }

            return next();
        }

        next();
    };
};


module.exports = checkPermission;
