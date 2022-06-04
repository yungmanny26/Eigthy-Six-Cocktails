const isLoggedIn = (req, res, next) => {

    // if user is not logged in, they should login first in order to do some stuff
    if(!req.session.currentUser){
        return res.redirect("/login");
    }
    next();
}

// what user can do if they are logged out

const isLoggedOut = (req, res, next) => {

    // if user is not logged in, they should login first in order to do some stuff
    if(req.session.currentUser){
        return res.redirect("/");
    }

    next();
}

module.exports = {
    isLoggedIn,
    isLoggedOut
}