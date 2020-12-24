const middlewareObj = {
    isSignedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        }
        res.json({
            message: 'Logged in failed'
        })
    }
}