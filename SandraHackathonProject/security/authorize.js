function authorize(roles) {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {

        if (!req.session.user)
            return res.redirect('/login');
       
        if (roles.length && !roles.includes(req.session.user.role))
            return res.redirect('/forbidden');
       
        next();
    }
}

export default authorize;