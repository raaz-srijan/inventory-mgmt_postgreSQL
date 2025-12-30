const checkPermission = (requiredPermission, scope = "BUSINESS") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user.role_name;

        if (scope === "PLATFORM") {
            const hasPermission = req.user.permissions.includes(requiredPermission) || role === 'super_admin';
            if (!hasPermission) {
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

            const hasPermission = req.user.permissions.includes(requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({ message: "Business permission denied" });
            }

            return next();
        }

        next();
    };
};

module.exports = checkPermission;
