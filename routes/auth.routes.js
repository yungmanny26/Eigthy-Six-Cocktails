const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
//const axios = require ("axios");

const User = require("../models/User.model");

const { isLoggedIn, isLoggedOut } = require("../config/route-guard.config");

// GET route to display the signup form to a user


router.get("/signup", isLoggedOut, (req, res, next) => {
  res.render("auth-pages/signup.hbs");
});

router.post("/create-account", (req, res, next) => {
  const saltRounds = 10;

  const { username, email, password } = req.body;
  console.log(username, email, password);

  if (!username || !email || !password) {
    res.render("auth-pages/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });

    return;
  }

  // make sure passwords are strong:
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    console.log("password is wrong");
    res.status(500).render("auth-pages/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
      });
    })
    .then((userFromDB) => {
      // console.log(`New user created: ${userFromDB}`);
      res.redirect("/profile");
    })
    .catch((err) => {
      // error message to make sure users fill in data in the valid format
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth-pages/signup", {
          errorMessage: err.message,
        });
      } else if (err.code === 11000) {
        // error message to prevent duplicates in the DB
        res.status(500).render("auth-pages/signup", {
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        console.log("error: ", err.message);
        next(err);
      }
    });
});

// ****************************************************************************
// GET route to display the login form
//                     ✅ add ✅
router.get("/login", isLoggedOut, (req, res, next) =>
  res.render("auth-pages/login.hbs")
);

// ****************************************************************************
// POST route to process the login form (enable a user to login)
// <form action="/process-login" method="POST">
router.post("/process-login", (req, res, next) => {
  // console.log("SESSION: ", req.session);
  const { email, password } = req.body;

  if (!email || !password) {
    res.render("auth-pages/login", {
      errorMessage:
        "All fields are mandatory. Please provide your email and password to login.",
    });

    return;
  }

  // use email address user inputted to check if the user exist in our DB
  User.findOne({ email })
    .then((userFromDB) => {
      // responseFromDB is a user object
      // if user doesn't exist, send error message
      if (!userFromDB) {
        res.render("auth-pages/login", {
          errorMessage: "Email is not registered. Try using different email.",
        });

        return;
      } else if (bcryptjs.compareSync(password, userFromDB.passwordHash)) {
        // if user exists, check if
        // password user inputted matches with the one saved in the DB
        // if yes, then render the profile page
        // res.render("user-pages/profile-page", { userFromDB })

        req.session.currentUser = userFromDB;
        console.log('current user:', req.session.currentUser)
        res.redirect("/profile");
      } else {
        // if passwords don't match, then send errorMessage to a user
        res.render("auth-pages/login", {
          errorMessage: "Incorrect password.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

// ****************************************************************************
// POST route to logout the user
// <form action="/logout" method="POST">

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    console.log(`Err while logout: ${err}`);

    if (err) next(err);
    res.redirect("/");
  });
});

// ****************************************************************************
// GET route to display user's profile page
//                      ✅ add ✅
router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("user-pages/profile-page");
});

// POST route to change the profile image
// <form action="/profile/change-image" method="POST" enctype="multipart/form-data">

// router.post("/profile/change-image", cloudinary.single("image"), (req, res, next) => {

//     User.findByIdAndUpdate(req.session.currentUser._id, { profileImg: req.file.path }, { new: true })
//     .then(updatedUser => {

//  to make sure the most updated changes are saved in the logged in user object
// we are saving updated user in the session
//         req.session.currentUser = updatedUser;
//         res.redirect("/profile")
//     })
//     .catch(err => {
//         console.log(err);
//         next(err);
//      })

// })
module.exports = router;
