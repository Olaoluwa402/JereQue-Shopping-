const Book = require("../models/book");
const Review = require("../models/review");



// all the middleare goes here
let middlewareObj = {};

// middlewareObj.adminAccess = function(req, res, next) {
//  if(req.isAuthenticated() && req.user.isAdmin){
//         next();
//     } 
//      req.flash("error", "You don't have permission to do that");
//     res.redirect("back");
// };

// middlewareObj.checkBookOwnership = function(req, res, next) {
//  if(req.isAuthenticated()){
//         Book.findById(req.params.id, function(err, foundBook){
//            if(err || !foundBook){
//                req.flash("error", "Book not found");
//                res.redirect("back");
//            }  else {
//                // does user own the book?
//             if(req.user.isAdmin) {
//                 next();
//             } else {
//                 req.flash("error", "You don't have permission to do that");
//                 res.redirect("back");
//             }
//            }
//         });
//     } else {
//         req.flash("error", "You need to be logged in to do that");
//         res.redirect("back");
//     }
// };

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                req.flash("error", "Review not found");
                res.redirect("/books");
            }  else {
                // does user own the review?
                if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.adminAccess = function(req, res, next) {
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            next();
        } else {
            req.flash("error", "You don't have permission to do that");
            res.redirect("back");
        }
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};


middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id).populate("reviews").exec(function (err, foundBook) {
            if (err || !foundBook) {
                req.flash("error", "Book not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundBook.reviews
                const foundUserReview = foundBook.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/books/" + foundBook._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

// middlewareObj.validate = (schema, property) => {
//     return (req, res, next) => {
//         const {error} = Joi.validate(req[property], schema);
//         const valid = error == null;
//         if (valid){next();}
//         else{
//             const {details} = error;
//             const message = details.map(i=>i.message).join(',');
//             console.log("error", message);
//             res.status(422).json({error:message});
//         }
//     };
// };


middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/users/login");
};

module.exports = middlewareObj;