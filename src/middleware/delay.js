const delay = (req, res, next) => {
    setTimeout(() => {
        next();
    }, 2000);
}

module.exports = delay;