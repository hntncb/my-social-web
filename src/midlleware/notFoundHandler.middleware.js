export const notFoundHandler = (req, res, next) => {
    return res.status(404).json({
        success: false,
        message: 'Endpoint khong ton tai'
    });
};