export const validateCreateUser = (req,res,next)=>{
    const {username, password} = req.body;

    if(!username || !password ) {
        return res.status(400).json({
            message: "hay nhap username va password",
        });
    }

    next();
};

