const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const white_lists = [
        '/',
        '/user/login',
        '/user/register',
        '/common/locations',
        '/common/timeslots',
    ]
    if (white_lists.find(item => '/api/v1' + item === req.originalUrl)) {
        next();
    } else {
        //req?.headers?.authorization?.split(' ')[1];
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];

            //verify token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(`>>> Check token: ${decoded}`);
                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({
                    EC: 1,
                    EM: 'Unauthorized'
                });
            }

        } else {
            //return exception
            return res.status(401).json({
                EC: 2,
                EM: 'Token expired'
            });
        }
    }
    console.log('>>> Check auth middleware:', req.originalUrl, req.route);
}

module.exports = auth;  