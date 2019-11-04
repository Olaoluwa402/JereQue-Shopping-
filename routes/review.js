const express = require("express");
const router = express.Router({mergeParams: true});
const Book = require("../models/book");
const Review = require("../models/review");
const middleware = require("../middleware");


// ***************************
// REVIEW ROTE
// ****************************
router.get("/new", middleware.isLoggedIn, async (req, res) => {
    let book
  try{
        book =  await Book.findById(req.params.id);
        res.render("reviews/new", {book: book});
  }catch{
        if(!book){
         req.flash("error", 'No associated book found');
        res.redirect("/books/show",)
      } else{
         req.flash("error", 'No associated book found2');
        res.redirect("/books")
      }
        // if(err || !book){
        // req.flash("error", "No associated book found")
        //  res.redirect("back")
        // }
  } 
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, async (req, res) => {
    //lookup book using ID
    try{
            const foundBook = await Book.findById(req.params.id).populate("reviews").exec();
            const newReview = new Review({
              text: req.body.text,
              rating: req.body.rating
            });
            const review = await Review.create(newReview); 
            //add author username/id and associated book to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            //save review
            await review.save();
            foundBook.reviews.push(review);
            // calculate the new average review for the campground
            foundBook.rating = calculateAverage(foundBook.reviews);
            //save campground
            await foundBook.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/books/' + foundBook._id);
    } catch {
             req.flash("error", "Error creating review. Pls try again");
            return res.redirect("back");
    }
    
 });

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function(req, res){
            Book.findById(req.params.id, function(err, foundBook){
            if(err || !foundBook){
                req.flash("error", "No book found")
                return res.redirect("/books")
            }
            Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                req.flash("error", "Review not found");
                res.redirect("/books");
            }else{
                res.render("reviews/edit", {book_id: req.params.id, review: foundReview});
            }
         });
        })
         

    // // res.send("review")
    //         let foundReview
    //     try{
    //          foundReview = await Review.findById(req.params.review_id);
    //          res.render("reviews/edit", {book_id: req.params.id, review: foundReview});
    //     }   catch{
    //             req.flash("error", "Review not found");
    //             res.redirect("/books");
    //          } 
        });

router.put("/:review_id", middleware.checkReviewOwnership, async (req, res) => {
          
            let book
            let review
    try{    
            review = await Review.findById(req.params.review_id);
            review.text = req.body.text,
            review.rating = req.body.rating
            await review.save();
            // const updatedReview = await Review.findByIdAndUpdate(req.params.review_id, newReview, {new: true});
            book = await Book.findById(req.params.id).populate("reviews").exec();
            // recalculate book average
            book.rating = calculateAverage(book.reviews);
            //save changes
            await book.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/books/' + book._id);
    } catch {
            if(review != null){
                res.render("reviews/edit", {book_id: req.params.id, review: review})
              } else{
                 req.flash("error", "Pls try again, something went wrong");
                return res.redirect("back");
              }
           
    }
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, async (req, res) => {
    let review
    let book
    try{
        review = await Review.findById(req.params.review_id);
        await review.remove();
        book = await Book.findById(req.params.id, {reviews: req.params.review_id, new: true}).populate("reviews").exec();
         // recalculate book average
            book.rating = calculateAverage(book.reviews);
            //save changes
            book.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/books/" + req.params.id);
    } catch(err){
            
            req.flash("error", 'Could not remove review. Try again');
            return res.redirect("back");
    }
});


function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;
