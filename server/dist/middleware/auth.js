import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
function getCookieValue(rawCookies, name) {
    if (!rawCookies)
        return undefined;
    const cookies = rawCookies.split(';').map((cookie) => cookie.trim());
    for (const cookie of cookies) {
        if (!cookie.startsWith(`${name}=`))
            continue;
        return decodeURIComponent(cookie.slice(name.length + 1));
    }
    return undefined;
}
export function optionalAuth(req, _res, next) {
    const bearerToken = req.headers.authorization?.replace('Bearer ', '');
    const cookieToken = getCookieValue(req.headers.cookie, 'devdash_token');
    const token = bearerToken || cookieToken;
    if (!token) {
        next();
        return;
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = payload;
    }
    catch {
        req.user = undefined;
    }
    next();
}
export function requireAuth(req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    next();
}
