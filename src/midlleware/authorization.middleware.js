
export const authorizeOwner = (req, res, next) => {
    const userId = Number(req.params.id);

    if (req.user?.id !== userId){
        return res.status(403).json({
            message: "ban khong co quyen thuc hien thao tac nay"
        });
    }
    next();
};

export const authorizeOwnerOrAdmin = (req, res, next) => {
    const userId = Number(req.params.id);

    if (req.user?.role === "admin") {
      return next();
    }

    if (req.user?.id !== userId){
        return res.status(403).json({
            message: "ban khong co quyen thuc hien thao tac nay"
        });
    }
    next();
};

export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin"){
        return res.status(403).json({
            message: "ban khong co quyen truy cap"
        });
    }
    next();
}

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "ban khong co quyen truy cap"
            });
        }
        next();
    };
};