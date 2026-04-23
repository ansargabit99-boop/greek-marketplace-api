import jwt from 'jsonwebtoken'
export function middleware(req,res,next) {
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({message:'Unauthorized'})
    }
    const token = authHeader.split(" ")[1]
    if(!token) {
        return res.status(401).json({message:'no token'})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch (err) {
        console.log('error detected',err)
        res.status(401).json({message:'token is invalid'})
    }
}
export function isModerator(req, res, next) {
    const role = req.user.role;

    if (role !== 'moderator') {
        return res.status(403).json({ message: 'Access denied' });
    }

    next(); // 👈 VERY IMPORTANT
}
// optional auth middleware - reads token if exists but doesn't block if missing
 export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return next() // no token, just continue
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
    } catch (err) {
        // invalid token, just ignore and continue as guest
    }
    next()
}

