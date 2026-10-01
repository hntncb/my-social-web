import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({
            message: "chua dang nhap"
        });
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "token khong hop le"
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: payload.sub,
            role: payload.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "token khong hop le hoac da het han"
        });
    }
};

const authMiddleware = { authenticate };

export default authMiddleware;