const express = require("express");
const router  = express.Router();
const bcrypt = require('bcryptjs');
const passport = require("passport");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fetch = require('node-fetch');

// const {validateBody, schemas} = require("../middleware/joival");
const { check, validationResult } = require('express-validator');
// const  Joi      =  require("@hapi/joi");
const User = require("../models/users");
const Order  = require("../models/order");
const Cart     = require("../models/cart");
const BookLimit     = require("../models/book_limit");
const Book = require("../models/book");





// landing
router.get("/", function(req, res){
  res.redirect("/books");
});

// router.use("/", notLoggedIn, function(req, res, next){
//   next();
// });
 


// show register form
router.get("/users/register", function(req, res){
  // const messages = req.flash('error');
     res.render("user/register");
});

router.post("/users/register", 
  [
    check('email', 'Email is not valid').isEmail().normalizeEmail(),
    check('firstName', 'firstname field is required').not().isEmpty().trim(),
     check('lastName', 'lastname field is required').not().isEmpty().trim(),
    check('password', 'Password field is required').not().isEmpty(),
    check('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
  ],
 function(req, res, done){ 
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      res.render('user/register', {errors:errors.array()});
      // return res.status(422).json(errors.array());
    } else {
      const { firstName, lastName, email, password, password2 } = req.body;
      User.findOne({ email: email }).then(user => {
      if (user) {
        console.log("user exist");
        res.render('user/register', {
          error: "Email already exists",
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          password2:password2
        });
      } else {
        const newUser = new User({
           firstName: firstName,
           lastName: lastName,
           email: email,
           password: password,
        });
      // admin check
      if(req.body.adminCode === "secretcode123"){
        newUser.isAdmin = true;
      }
      // hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                    if(req.session.oldUrl){
                       const oldUrl = req.session.oldUrl;
                        req.session.oldUrl = null;
                        req.flash("success", "You are now registered and can log in " + user.firstName);
                        res.redirect("/shop" + oldUrl);
                    } else {
                      req.flash("success", "You are now registered and can log in " + user.firstName);
                      res.redirect("/users/login");
                    }
                
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
    });

  // const { firstName, lastName, email, password, password2 } = req.body;
  // let errors = [];


  // if (!firstName || !lastName || !email || !password || !password2 ) {
  //    // errors.push({ msg: 'Please enter all fields' });
  //    req.flash("error", "Please enter all fields" );
  // }

  // if (password != password2) {
  //   // errors.push({ msg: 'Passwords do not match' });
  //    req.flash("error", "Passwords do not match" );
  // }

  // if (password.length < 6) {
  //   // errors.push({ msg: 'Password must be at least 6 characters' });
  //   req.flash("error", "Password must be at least 6 characters" );
  // }

//   if (errors.length > 0) {
//     res.render('user/register', {
//       errors: errors,
//       firstName: firstName,
//       lastName: lastName,
//       email: email,
//       password: password,
//       password2:password2
//     });
//   } else {
//     User.findOne({ email: email }).then(user => {
//       if (user) {
//         req.flash("error", "Email already exists" );
//         // errors.push({ msg: 'Email already exists' });
//         res.render('user/register', {
//           errors: errors,
//           firstName: firstName,
//           lastName: lastName,
//           email: email,
//           password: password,
//           password2:password2
//         });
//       } else {
//         const newUser = new User({
//            firstName: firstName,
//            lastName: lastName,
//            email: email,
//            password: password,
//         });

//         bcrypt.genSalt(10, (err, salt) => {
//           bcrypt.hash(newUser.password, salt, (err, hash) => {
//             if (err) throw err;
//             newUser.password = hash;
//             newUser
//               .save()
//               .then(user => {
//                 req.flash(
//                   'success',
//                   'You are now registered and can log in' 
//                 );
//                 res.redirect('/users/login');
//               })
//               .catch(err => console.log(err));
//           });
//         });
//       }
//     });
//   }
 // });



// router.post("/users/register", passport.authenticate("local.signup", {
//   successRedirect: ("/books"),
//   failureRedirect: ("/users/register"),
//   failureFlash: true
// }));

//handle sign up logic
// router.post("/users/register", [
//     check('email', 'Email is not valid').isEmail().normalizeEmail(),
//     check('username', 'Username field is required').not().isEmpty().trim(),
//     check('password', 'Password field is required').not().isEmpty(),
//     check('password1').custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error('Password confirmation does not match password');
//       }
//       // Indicates the success of this synchronous custom validator
//       return true;
//     })
//   ],  function(req, res, done){
//      const errors = validationResult(req);
  
//     if (!errors.isEmpty()) {
//       // console.log(errors);
//       res.render('user/register', {errors:errors.array()});
//       // return res.status(422).json(errors.array());
//     } else {
//       const newUser = new User({
//       username: req.body.username,
//       email: req.body.email,
//     });
//       console.log(newUser);
//     User.register(newUser, req.body.password, function(err, user){
//       // console.log(user);
    
//         if(err){
//            // console.log(err);
//               req.flash("error", err.message);
//               return res.render("user/register");
//         }
//         passport.authenticate("local")(req, res, function(){
//            // req.flash("success", "Welcome " + user.username);
//            // res.redirect("/books"); 
//             if(req.session.oldUrl){
//               const oldUrl = req.session.oldUrl;
//                     req.session.oldUrl = null;
//                    res.redirect("/shop" + oldUrl);
//                 } else {
//                   req.flash("success", "Welcome " + user.username);
//                   res.redirect("/users/dashboard");
//                 }
//         });

//     });
//     }
// });

            

//show login form
router.get("/users/login", function(req, res, next){
   res.render("user/login"); 
});

//handling login logic
router.post("/users/login", passport.authenticate("local", 
    {
        failureRedirect: "/users/login",
        failureFlash: true,
    }), function(req, res, next){
    if(req.session.oldUrl){
       let oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect("/shop" + oldUrl);
    } else {
      const userId = req.user._id;
      req.flash("success", "Welcome back");
      res.redirect("/users/dashboard/");
    }
});


// logout route
router.get("/users/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/books");
   // req.session.destroy();
});


// admin settings
router.get("/admin/settings", isLoggedIn, async (req, res) => {

  try{
        const bookLimit = await BookLimit.findOne({});
       res.render("admin/settings", {bookLimit: bookLimit});
  } catch(e){
      console.log(e);
  }
   
});

router.post("/admin/save_settings", function(req, res){
    BookLimit.updateOne({}, {
      "book_limit": req.body.book_limit
    }, {upsert:true}, function(error, document){
        if(error){
          console.log(error);
        }
      req.flash("success", "Limit update successful");
      res.redirect("/admin/settings");
    });
   
});
// render dashboard page 
router.get("/users/dashboard", isLoggedIn, async (req, res, next) =>{
    try{
     const orders = await Order.find({user: req.user}).limit(1).sort({paid_At: 'desc'});
      let orderTotal = await Order.find({user: req.user});
     let cart;
      orders.forEach((order)=>{
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
       res.render("dashboard/index", {orders : orders, orderTotal :orderTotal});
  }catch(err){
           if (err){
        console.log(err);
      }
  }
}); 

// send users orders to  dashboard page using ajax call
router.get("/get-user-orders/:page/:limit", isLoggedIn, async (req, res, next) =>{
      const page = req.params.page
      const limit =req.params.limit

      const startIndex = (page - 1) * limit
      const endIndex = page * limit
        try{

      let orders = await Order.find({user: req.user}).skip(parseInt(startIndex)).limit(parseInt(limit)).sort({paid_At: 'desc'});
      let cart;
      orders.forEach((order) => {
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      
      res.send(orders);
    } catch(err){
          if (err){
            console.log(err);
        }
    }
}); 



// USER PROFILE
router.get("/users/:id", isLoggedIn, function(req, res){

       User.findById(req.params.id, function(error, foundUser){
        if(error || !foundUser){
             req.flash("error", 'Sorry, Cannot find Associated User!');
             return res.redirect("/books")
        }
            // render profile template with that user
            res.render("user/profile/show", {user: foundUser});
       })
          //find the user profile with provided ID
          // let foundUser
          // try{
          //      foundUser = await User.findById(req.params.id);
          //      //render profile template with that user
          //         res.render("user/profile/show", {user: foundUser});
          // } catch (err){
          //         if(err){
          //           req.flash("error", 'Something went wrong!');
          //          res.redirect("/users/dashboard")
          //         } 
          // } 
    });

//profile Edit route
router.get("/users/:id/edit", isLoggedIn, function(req, res){

       User.findById(req.params.id, function(error, newInfo){
        if(error || !newInfo ){
              req.flash("error", 'Sorry, Cannot find Associated User!');
             return res.redirect("/books")
        }
            // render profile template with that user
           res.render("user/profile/edit", {user: newInfo});
       })

      // try{
      //     const newInfo = await User.findById(req.params.id);
      //          //render register template and populate with that user info
      //             res.render("user/profile/edit", {user: newInfo});
      // }catch (e){
      //         if(e){
      //              // console.log(e);
      //            req.flash("error", 'Sorry, Cannot find Associated User!');
      //            res.redirect("/users/" + req.params.id + "/edit")
      //         }
      //     }
});


// Profile update route
 router.put("/users/:id", isLoggedIn, [
    check('email', 'Email is not valid').isEmail().normalizeEmail(),
    check('firstName', 'firstname is required').not().isEmpty().trim(),
     check('lastName', 'lastname is required').not().isEmpty().trim(),
      // Indicates the success of this synchronous custom validator
  ], async (req, res, done) => {

     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      const user = await User.findById(req.params.id);
      res.render("user/profile/show", {errors:errors.array(), user: user });
      // return res.status(422).json(errors.array());
    } else{
          let newUpdate 
          try{
             newUpdate = await User.findById(req.params.id);
             newUpdate.firstName = req.body.firstName,
             newUpdate.lastName = req.body.lastName,
             newUpdate.email = req.body.email,
             // newUpdate.password = req.body.password
              

             //     // hash password
             //  bcrypt.genSalt(10, (err, salt) => {
             //    bcrypt.hash(newUpdate.password, salt, async (err, hash) => {
             //      if (err) throw err;
             //      newUpdate.password = hash;
                    await newUpdate.save();
                     const showUrl = "/users/" + req.params.id;
                     res.redirect(showUrl)
            }catch {
              req.flash("error", "Unable to update data. Try again");
              res.redirect("/users/" + req.params.id)
          }
      }

});


//password Edit route
router.get("/users/password/:id", isLoggedIn, function(req, res){

      User.findById(req.params.id, function(error, newInfo){
        if(error || !newInfo ){
              req.flash("error", 'Sorry, Cannot find Associated User!');
             return res.redirect("/books")
        }
            // render profile template with that user
           res.render("user/profile/password-edit", {user: newInfo});
       })

      // try{
      //     const newInfo = await User.findById(req.params.id);
      //          //render register template and populate with that user info
      //             res.render("user/profile/password-edit", {user: newInfo});
      // }catch (e){
      //         if(e){
      //              // console.log(e);
      //            req.flash("error", 'Something went wrong!');
      //            res.redirect("/users/" + req.params.id)
      //         }
      //     }
});


// Password update route
 router.put("/users/password/:id", isLoggedIn, [
    check('password', 'Old password is required').not().isEmpty(),
    check('password2', 'new password is required').not().isEmpty()
      // Indicates the success of this synchronous custom validator
  ], async (req, res, done) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      const user = await User.findById(req.params.id);
      res.render("user/profile/password-edit", {errors:errors.array(), user: user });
      // return res.status(422).json(errors.array());
    } else{
          let userPasswordUpdate
          try{
            userPasswordUpdate = await User.findById(req.params.id);
            // console.log("This is the paswword" + userPasswordUpdate.password)
          
                    // Match password
              bcrypt.compare(req.body.password, userPasswordUpdate.password, async (err, isMatch) => {
                if (err) throw err;
                // console.log(isMatch)
                if (isMatch) {
                  // return done(null, userPasswordUpdate);
                  // hash password
                  bcrypt.genSalt(10, (err, salt) => {
                      bcrypt.hash(req.body.password2, salt, async (err, hash) => {
                        if (err) throw err;
                        // console.log("this is the hash" + hash)
                        userPasswordUpdate.password = hash;
                         // console.log(userPasswordUpdate.password)
                         await userPasswordUpdate.save(); 

                     req.flash("success", "password successfully changed");
                     const showUrl = "/users/" + req.params.id;
                     res.redirect(showUrl)
                      });
                       
                    });
                
                } else {
                   // console.log("password incorrect");
                  return done(null, false, { message: 'Password incorrect' });
                }
              });
            }catch (e){
              // console.log(e)
              req.flash("error", "Unable to update data. Try again");
              res.redirect("/users/" + req.params.id)
            }
          }
      }
);



router.get("/contact", function(req, res){
   const MAP_KEY = process.env.MAP_KEY
   // console.log(MAP_KEY)
    res.render("contact/contact", {MAP_KEY:MAP_KEY});
});

    // forgot password
router.get('/forgot', function(req, res) {
  res.render('user/forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    
     function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        port: 587, 
        secure: false,
        auth: {
          user: 'danville4real007@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      const mailOptions = {
        from: 'danville4real007@gmail.com',
        to: user.email,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + 'localhost:3000' + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err){
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    // req.flash("error", "Please try again later!");
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('user/reset', {token: req.params.token});
  }); 
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err){
              req.logIn(user, function(err){
                done(err, user);
              });
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'danville4real007@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'danville4real007@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash('success', 'Success! Your password has been changed.');
        done(err); 
      });
    }
  ], function(err) {
    res.redirect('/books');
  });
});

// router.get("/map_api", async (req, res) => {
//   const map_url = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAsgzJYbUWq5Wimyr7--3NqHWEezFYmSaM&callback=initMap`;
//   const map_response = await fetch(map_url);
//   const map_json = await map_response.json()
//   res.json(json);
// });


function isLoggedIn (req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/books");
}



module.exports = router;

