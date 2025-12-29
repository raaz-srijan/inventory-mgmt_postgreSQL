const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const hasPermission = req.user.permissions.includes(requiredPermission) || req.user.role_name === 'super_admin';

        if (!hasPermission) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
};

module.exports = checkPermission;
