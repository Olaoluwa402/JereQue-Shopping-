const express = require("express");
const router  = express.Router();
const passport = require("passport");
const Category = require("../models/category");
const Book = require("../models/book");



// All category
router.get("/", async (req, res) => {
	let searchOptions = {};
	if (req.query.name != null && req.query.name !== '') {
		searchOptions.name = new RegExp(req.query.name, 'i')
	}
  try{
   	const categories = await Category.find(searchOptions);
  	 res.render("category/index", {
  	 	categories:categories,
  	 	searchOptions: req.query
  	 });
   } catch (error){
  	req.flash("error", "unable to find category");
  	res.redirect("/category");
   }
});

// called by AJAX
router.get("/partials", async (req, res) => {
	
  try{
   	const categories = await Category.find({});
  	 res.send(categories);
  	 
   } catch (error){
  	req.flash("error", "unable to find category");
  	res.redirect("/category");
   }
});



// show create new category form
router.get("/new", function(req, res){
    res.render("category/new");
});

// handle category form data
router.post("/", async (req, res) => {
    // get data from form and add to category array
    const name = req.sanitize(req.body.name);
    const newCategory = {
    	name: name, 
    };
    // Create a new category and save to DB
    try{
    	const newlycreated = await Category.create(newCategory);
    	//redirect back to category page
           res.redirect("/category");
    } catch (error){
    	req.flash("error", "unable create category");
  		res.redirect("/category/new");
    }
 });

// Render all books under each category
router.get("/:id", async (req, res) => {
	// res.send("Category" + req.params.id)
	try{ 
		const resp = await Book.find().sort({createdAt: 'desc'}).limit(12).populate({"path": "category", match:{"_id":req.params.id}}).exec();
		const books = resp.filter(function(i){
			    return i.category != null;
			  });
    const myTotalResp= await Book.find().populate({"path": "category", match:{"_id":req.params.id}}).exec();
    const myTotal = resp.filter(function(i){
          return i.category != null;
        });

			 res.render("category/show", {books: books, myTotal: myTotal });
	} catch{
		    	req.flash("error", "something went wrong with fetching associated books");
		  		res.redirect("/books");
       }
     });

// ajax call
router.get("/get-category/:page/:limit", async (req, res) => {

  
  console.log(req.params.page)
  console.log(req.params.limit)
   try{
    const resp = await Book.find().populate({"path": "category", match:{"_id":req.params.id}}).sort({createdAt: 'desc'}).skip(parseInt(req.params.page)).limit(parseInt(req.params.limit)).exec();
    const books = resp.filter(function(i){
          return i.category != null;
        });

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


router.get("/:id/edit", function(req, res){
  Category.findById(req.params.id, function(err, category){

    if(err || !category){
      req.flash("error", "Category not found")
      res.redirect("/category");
    }else{
      res.render("category/edit", {cate : category});
    }
  })
 });

router.put("/:id", async (req, res) => {
     let category
    try{
       category = await Category.findById(req.params.id);
       category.name = req.body.name
         await category.save();
           res.redirect("/category");
    } catch (error){
      if(category == null){
        res.redirect("/books")
      } else {
         req.flash("error", "error updating category");
         res.render("/category/new", {category:category});
      }
      
    }
 });

router.delete("/:id", async (req, res) => {
      let category
    try{
       category = await Category.findById(req.params.id);
         await category.remove();
           res.redirect("/category");
    } catch (error){
      if(category == null){
        res.redirect("/books")
      } else {
         req.flash("error", "unable to delete category. Be sure category has no books!");
          res.redirect("/category");
      }
      
    }
 });




module.exports = router;

