// const express = require("express");
// const router  = express.Router({mergeParams: true});
// const middleware = require("../middleware");
// const Book = require("../models/book");
// const Rating = require("../models/rating");
 
// router.post('/', middleware.isLoggedIn, middleware.checkRatingExists, function(req, res) {

// 	Book.findById(req.params.id, function(err, book) {
// 		if(err) {
// 			console.log(err);
// 		} 
// 		else if (req.body.rating) {
// 				Rating.create(req.body.rating, function(err, rating) {
// 				  if(err) {
// 				    console.log(err);
// 				  }
// 				  rating.author.id = req.user._id;
// 				  rating.author.username = req.user.username;
// 				  rating.save();
// 					book.ratings.push(rating);
// 					book.save();
// 					req.flash("success", "Successfully added rating");
// 				});
// 		} else {
// 				req.flash("error", "Please select a rating");
// 		}
// 		res.redirect('/books/' + book.id);
// 	});
// });

// module.exports = router;