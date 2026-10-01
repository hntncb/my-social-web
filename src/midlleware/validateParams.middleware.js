const validationId = (req, res, next) => {
    let location = 'body';
    if (req.params && req.params.id !== undefined) {
        req.params.id = Number(req.params.id);
        location = 'params';
    }

    const middlewareFn = validatePositiveIntegers([
        { location: location, name: 'id' }
    ]);

    middlewareFn(req, res, next);
};

const validationUsername = (req, res, next) => {
    const username = req.body?.username;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username khong duoc de trong'
        });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{8,30}$/;
    if (!usernameRegex.test(String(username).trim())) {
        return res.status(400).json({
            success: false,
            message: 'Username khong hop le'
        });
    }

    req.body.username = String(username).trim();
    next();
};

const validationPassword = (req, res, next) => {
    const password = req.body?.password;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password khong duoc de trong'
        });
    }

    const passStr = String(password);
    const isValidLength = passStr.length >= 8 && passStr.length <= 100;
    const hasLetter = /[a-zA-Z]/.test(passStr);
    const hasNumber = /[0-9]/.test(passStr);

    if (!isValidLength || !hasLetter || !hasNumber) {
        return res.status(400).json({
            success: false,
            message: 'Password khong hop le'
        });
    }

    next();
};

const validatePositiveIntegers = (fields) => {
    return (req, res, next) => {
        for (const {location,name} of fields){
            const rawValue = req[location]?.[name];
            if(!rawValue || rawValue === undefined || rawValue === null || isNaN(rawValue) || String(rawValue).trim() == ''){
                return res.status(400).json({
                    success: false,
                    message: `${name} khong duoc de trong`
                })
            }

            const parsedValue = Number(rawValue);

            if(parsedValue < 0 || isNaN(parsedValue) || !Number.isInteger(parsedValue)){
                return res.status(400).json({
                    success: false,
                    message: `${name} khong hop le hoac bi thieu`
                })
            }
            req[location][name] = parsedValue;
        }
        next();
    }
};

const validateCursorParams = validatePositiveIntegers([
    { location: 'query', name: 'post_id' },
    { location: 'query', name: 'limit' }
]);

const validateOffsetParams = validatePositiveIntegers([
    { location: 'query', name: 'limit' },
    { location: 'query', name: 'offset' }
]);

const validatePostBody = (body) => {
    const title = body?.title ? String(body.title).trim() : '';
    const content = body?.content ? String(body.content).trim() : '';
    const url = body?.url ? String(body.url).trim() : '';

    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    let urlError = null;

    if (url && !urlRegex.test(url)) {
        urlError = 'url phai co dang https:// hoac http://';
    }

    return { title, content, url, urlError };
};

export const validateCreatePost = (req, res, next) => {
    const { title, content, url, urlError } = validatePostBody(req.body);

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'title va content khong duoc de trong'
        });
    }

    if (urlError) {
        return res.status(400).json({ success: false, message: urlError });
    }
    
    next();
};

export const validateUpdatePost = (req, res, next) => {
    const { title, content, url, urlError } = validatePostBody(req.body);

    if (!title && !content && !url) {
        return res.status(400).json({
            success: false,
            message: 'phai co it nhat 1 trong: title, content, url'
        });
    }

    if (urlError) {
        return res.status(400).json({ success: false, message: urlError });
    }

    next();
};
const validateUserParams = (req, res, next) =>{
    const {email, username, password} = req.body || {};

    const hasEmail = email ? String(email).trim() : '';
    const hasUsername = username ? String(username).trim() : '';
    const hasPassword = password ? String(password).trim() : '';

    if(!hasEmail && !hasUsername && !hasPassword){
        return res.status(400).json({
            success: false,
            message: 'phai co 1 trong: email, username, password'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(hasEmail){
        if(!emailRegex.test(String(email.trim()))){
        return res.status(400).json({
            success: false,
            message: 'email khong hop le'
        });
    }};

    next();
}

const validateParams = { validationId, validationUsername, validationPassword, validateCursorParams, validateOffsetParams, validateCreatePost, validateUpdatePost, validateUserParams, validatePostBody };

export default validateParams;