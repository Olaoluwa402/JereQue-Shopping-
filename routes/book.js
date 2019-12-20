const express = require("express");
const router = express.Router({mergeParams: true});
const passport = require("passport");
const _ = require('lodash');



const Book = require("../models/book");
const Category = require("../models/category");
const Review = require("../models/review");
const Cart     = require("../models/cart");
const Order     = require("../models/order");
const BookLimit     = require("../models/book_limit");
let request = require('request');
let {initializePayment, verifyPayment} = require('../config/paystack')(request);

// const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif'];

 const middleware = require("../middleware");


 // multer and cloudinary confiq
  const multer = require('multer');
  const storage = multer.diskStorage({
    filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
// const upload = multer(
// 	{ storage: storage, limits:{fileSize: 1500000},fileFilter: imageFilter}
// 	).array('myfiles[]', 4);

const upload = multer(
	{ storage: storage, limits:{fileSize: 1500000},fileFilter: imageFilter}
	).any(
      [
      	{
      		name: "image",
      		maxCount: 1
      	},
      	{
      		name: "image_1",
      		maxCount: 1
      	},
      	{
      		name: "image_2",
      		maxCount: 1
      	},
      ]

	);

const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'oladan', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});







// All books page
// Book.find().populate({'path': 'category', match:{'name':'Medical'}})
router.get("/", async (req, res, next) => {
  const limit = await BookLimit.findOne({});
  const limitResult = parseInt(limit.book_limit);

  let query = Book.find().sort({createdAt: 'desc'}).limit(limitResult);
  if (req.query.book_title != null && req.query.book_title != ''){
    query = query.regex('book_title', new RegExp(req.query.book_title, 'i'));
  }
   try {
    const books = await query.exec();
    const myTotal = await Book.find();
      res.render("book/landing", {
        books: books,
        searchOptions: req.query,
        limitResult: limitResult,
        myTotal: myTotal
      });
   } catch(error){
      if(error){
        res.redirect("/users/login");
      }
   }
});

// ajax call
router.get("/get-books/:page/:limit", async (req, res) => {
	// let query =  Book.find().sort({createdAt: 'desc'}).skip(parseInt(req.params.page)).limit(parseInt(req.params.limit));
 //  if (req.query.book_title != null && req.query.book_title != ''){
 //     query = query.regex('book_title', new RegExp(req.query.book_title, 'i'));
 //  }
  const page = req.params.page
  const limit =req.params.limit

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
   try{
    const  books = await Book.find().sort({createdAt: 'desc'}).skip(parseInt(startIndex)).limit(parseInt(req.params.limit));
    res.send(books);
      // res.render("book/landing", {
      //   books: books,
      //   searchOptions: req.query,
      // });
   } catch(error){
      if(error){
        console.log(error);
      }
   }
})


// create books route
router.post("/",  middleware.adminAccess, async (req, res, next) => {
    upload(req, res, async(err) =>{
          if(err){
          	// console.log(err);
            req.flash('error', err.message + ' ' + "Total Image size should not exceed 1.5mb");
            res.redirect('/books/new')
          }else{
            // console.log(req.files)
         

           let res_promises = req.files.map(file => new Promise((resolve, reject) => {
              cloudinary.uploader.upload(file.path, {width:800, height:800}, function(error, result){
                 if(error){
                  req.flash('error', "Something went wrong with the file upload. Please try again");
                  res.redirect('/books/new')
                 } else resolve(result)
                  // reject(error)
               })
             })
           )
            
           // promise.all will fire when all promises are resolved
           Promise.all(res_promises)
             .then(result => {
                
                 // console.log(result[0].secure_url)

                 // console.log(result)
                const   book_title = req.body.book_title; 
                const   availability = req.body.availability;
                const   price = req.body.price;
                const   category = req.body.category;
                const   description = req.sanitize(req.body.description);
                const   image = req.body.image = result[0].secure_url;
                const   imageId = req.body.imageId = result[0].public_id;
                const   image_1 = req.body.image_1 = result[1].secure_url;
                const   imageId_1 = req.body.imageId_1 = result[1].public_id;
                const   image_2 = req.body.image_2 = result[2].secure_url;
                const   imageId_2 = req.body.imageId_2 = result[2].public_id;

                const newBook = {
                book_title: book_title, 
                price: price,
                category: category,
                description: description,
                availability: availability, 
                image: image,
                imageId:imageId, 
                image_1:image_1 ,
                imageId_1:imageId_1,
                image_2:image_2, 
                imageId_2 :imageId_2,
              }

                   // save to db
                 Book.create(newBook, function(err, newlyCreated){
                 if(err){
                 req.flash("error", "error saving to database. Please ensure all fields are field");
                 res.redirect("/books/new");
                 } else{
                 //redirect back to books page
                 res.redirect("/books/" + newlyCreated.id);
                  }
             });
  

            })
            .catch((error)=> {console.log(error)})
        }  
    })
});


// create new books route
router.get("/new", middleware.adminAccess, async (req, res) => {
  renderNewPage(res, new Book());
 
});



// SHOW - shows more info about one book
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Book.findById(req.params.id).populate({
      path: "reviews",
      options: {sort: {createdAt: -1}}
      }).exec(function(err, foundBook){
        if(err || !foundBook){
            req.flash("error", "Book not found")
           res.redirect("/books")
        } else {
            //render show template with that Book
            res.render("book/show", {book: foundBook});
        }
    });
});

// edit route
router.get("/:id/edit", middleware.adminAccess, function(req, res){
       Book.findById(req.params.id, function(err, book){
        if(err || !book){
          req.flash("error", "Book not found")
          res.redirect("/books");
        }else{
          renderEditPage(res, book)
        }
       });
   
});

   //update route
 
router.put("/:id",  middleware.adminAccess, async (req, res) => {
     Book.findById(req.params.id, async (err, book) => {
        if(err){
            console.log(err);
              if(book != null){
                renderEditPage(res, book, true)
              } else{
                res.redirect("/books");
              }
        } else {
            upload(req, res, async (err) =>{
            
              if(err){
                    req.flash('error', err.message + ' ' + "Image size should not exceed 1mb");
                    res.redirect('/books/new')
                  }else{ 
                      if (req.files) { 
                      	// let selected_files = req.files
                      	  try {
                      	  //   for(let i=0; i<selected_files.length; i++){
	                      		// if(selected_files[i].image){
	                      		// 	await cloudinary.uploader.destroy(book.imageId);
	                      		// }
	                      		// if(selected_files[i].image_1){
	                      		// 	await cloudinary.uploader.destroy(book.imageId_1);
	                      		// }
	                      		// if(selected_files[i].image_2){
	                      		// 	await cloudinary.uploader.destroy(book.imageId_2);
	                      		// }
	        
                      	  //   }
                           console.log(req.files)
                           let res_promises = req.files.map(file => new Promise((resolve, reject) => {
					              cloudinary.uploader.upload(file.path, {width: 800, height:800}, async (error, result) =>{
					                      if(error){
                                  req.flash('error', "Something went wrong with the file upload. Please try again");
                                  res.redirect('/books/new')
                                 } else resolve(result)
					               })
					             })
					           )
            
				           // promise.all will fire when all promises are resolved
				           Promise.all(res_promises, async (result) => {
				             	console.log(result)
				             	if(result[0]){
				             	  await cloudinary.uploader.destroy(book.imageId);
				             	  book.image = await result[0].secure_url;
		                          book.imageId = await result[0].public_id;
				             	}
				             	if(result[1]){
				             	  await cloudinary.uploader.destroy(book.imageId_1);
				             	  book.image_1 = await result[1].secure_url;
		                          book.imageId_1 = await result[1].public_id;
				             	}
				             	if(result[2]){
				             	  await cloudinary.uploader.destroy(book.imageId_2);
				             	  book.image_2 = await result[2].secure_url;
		                          book.imageId_2 = await result[2].public_id;
				             	}


				             	   book.book_title = req.body.book_title; 
			                       book.description = req.body.description;
			                       book.price = req.body.price;
			                       book.availability = req.body.availability
			                       book.category = req.body.category;
			                   
			                       book.save();
			                       req.flash("success","Successfully Updated!");
			                       res.redirect("/books");
		                    
						      })
                           
                         
                      } catch(err) {
                          req.flash("error", err.message);
                          return res.redirect("back");
                      }
                     }
                    }
                      
           
          });
        }
     });
});


// router.put("/:id",  middleware.adminAccess, async (req, res) => {
//      Book.findById(req.params.id, async (err, book) => {
//         if(err){
//             console.log(err);
//               if(book != null){
//                 renderEditPage(res, book, true)
//               } else{
//                 res.redirect("/books");
//               }
//         } else {
//             upload(req, res, async(err) =>{
            
//               if(err){
//                     req.flash('error', err.message + ' ' + "Image size should not exceed 1mb");
//                     res.redirect('/books/new')
//                   }else{ 
//                       if (req.files) {
//                         try {
//                           await cloudinary.uploader.destroy(book.imageId);
//                           const result = await cloudinary.uploader.upload(req.file.path);
//                           book.imageId = result.public_id;
//                           book.image = result.secure_url;
//                       } catch(err) {
//                           req.flash("error", err.message);
//                           return res.redirect("back");
//                       }
//                      }
//                     }
//                        book.book_title = req.body.book_title; 
//                        book.description = req.body.description;
//                        book.price = req.body.price;
//                        book.availability = req.body.availability
//                        book.category = req.body.category;
                   
//                        book.save();
//                        req.flash("success","Successfully Updated!");
//                        res.redirect("/books");
                
            
           
//           });
//         }
//      });
// });



// Delete route
router.delete("/:id", middleware.adminAccess,  async (req, res) => {
  let book
  try{
      book = await Book.findById(req.params.id);
       // deletes all reviews associated with the Book
        await Review.deleteOne({"_id": {$in: book.reviews}});  
      // delete the book 
        await cloudinary.uploader.destroy(book.imageId);
        await cloudinary.uploader.destroy(book.imageId_1);
        await cloudinary.uploader.destroy(book.imageId_2);
        await book.deleteOne();
        req.flash("success", "Book deleted successfully!");
        res.redirect("/books");
  } catch {
      if(book != null){
         req.flash("error", 'Could not remove book');
        res.render("book/show", {book:book})
      } else{
        res.redirect("/books")
      }
  } 
 
});


async function renderNewPage(res, book, error = false){
	 try{
  		const categories = await Category.find({});
  		const params =  {
   		 	   categories: categories,
               book: book
    		 }
    		 if(error){
          console.log(error)
           req.flash("error", 'Unable to edit book');
        }
   		     res.render("book/new", params);
   }catch(error){
   	 if(error){
   		 res.redirect("/books/new");
   	 }
  }
}

async function renderEditPage(res, book, error = false){
   try{
      const categories = await Category.find({});
      const params =  {
           categories: categories,
               book: book
         }
         if(error){
          console.log(error)
           req.flash("error", 'Unable to edit book');
        }
           res.render("book/edit", params);
   }catch(error){
     if(error){
       res.redirect("/books/new");
     }
  }
}

// function saveCover(book, coverEncoded){
// 	if(coverEncoded == null) return
// 	const cover = JSON.parse(coverEncoded) 

// 	if(cover != null && imageMineTypes.includes(cover.type)){
// 		book.coverImage = new Buffer.from(cover.data, 'base64');
// 		book.coverImageType = cover.type;
// 	}else{console.log("something went wrong")}
// }

function isLoggedIn (req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/users/login");
}

module.exports = router;
