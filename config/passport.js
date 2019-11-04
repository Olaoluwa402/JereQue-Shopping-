const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require("../models/users");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          console.log("not user");
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
             console.log("password incorrect");
            return done(null, false, { message: 'Password incorrect' });
          }
        });
    });
  })
);

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};





// const passport    = require("passport");
// const    User        = require("../models/users");
// const  Joi      =  require("@hapi/joi");
// const LocalStrategy = require("passport-local").Strategy;


// passport.serializeUser(function(user, done){
//    done(null, user.id);
// });
// passport.deserializeUser(function(id, done){
//   User.findById(id, function(err, user){
//     done(err, user);
//   } );
// });

// passport.use('local.signup', new LocalStrategy({
//   usernameField: "email",
//   passwordField:"password", 
//   passReqToCallback: true
// }, 
// function(req, email, password, done){

// 	const Schema = Joi.object().keys({
// 		"email": Joi.string().trim().email().required(),
// 		"firstName": Joi.string().required(),
// 		"lastName": Joi.string(),
// 		"password": Joi.string().min(5).max(10).required()
// 	});

// 	Schema.validate({
// 		email:req.body.email, firstName:req.body.firstName, lastName:req.body.lastName, password:req.body.password 
// 	},

// 	 (err, result) => {
// 		if(err){
//       console.log(err)
//       res.send("an error has occured");
//     }
// 		res.send("successfully posted data");
//     next();
// 	});

// 	// let {error} = ValidationError(req.body);
// 	// if(error){return res.status(403).send(error.details[0].message);}


//     User.findOne({"email":email}, function(err, user){
//       if(err){ 
//       	console.log("error in signup + err");
//         return done(err);
//       }
//       if(user){
//       	console.log("email is already in use");
//         return done(null, false, req.flash("error","email is already in use"));
//       }

//       const newUser = new User();
//       newUser.email = email;
//       newUser.firstName = req.body.firstName;
//       newUser.lastName = req.body.lastName;
//       newUser.password = newUser.encryptPassword(password);
     
   
//       newUser.save(function(err, result){
//         if(err){
//         return done(err);
//       }
//        return done(null, newUser);
//       });
//     });
// }));

// function ValidationError(message){
// 	const Schema = Joi.object().keys({
// 		"email": Joi.string().trim().email().required(),
// 		"firstName": Joi.string().required(),
// 		"lastName": Joi.string(),
// 		"password": Joi.string().min(5).max(10).required()
// 	});
// 	return Schema.validate(message, Schema);
// }
// 
