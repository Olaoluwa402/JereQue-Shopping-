const express = require("express");
const router  = express.Router();
const passport = require("passport");
const request = require('request');
const _ = require('lodash');
const Book = require("../models/book");
const Category = require("../models/category");
const Cart     = require("../models/cart");
const Order     = require("../models/order");
const {initializePayment, verifyPayment} = require('../config/paystack')(request);

const middleware = require("../middleware");



router.get("/shopping-cart", (req, res) => {
    if(!req.session.cart){
      return res.render("shop/shopping-cart", {books:null});
    }

    const cart = new Cart(req.session.cart);
    res.render("shop/shopping-cart", {books : cart.generateArray(), total : cart.totalPrice});

 
  });




router.post("/paystack/pay", isLoggedIns, function(req, res, next){
   if(!req.session.cart){
      return res.render("shop/shopping-cart");
    }

     const cart = new Cart(req.session.cart);
      const form = _.pick(req.body,["full_name", "email", "phone_number", "address"]);
    form.metadata = {
        full_name : form.full_name,
        phone_number: form.phone_number,
        address: form.address
    };
    form.amount = cart.totalPrice * 100;
    initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            console.log(error);
            return;
       }

       const response = JSON.parse(body);
        res.redirect(response.data.authorization_url);
    });
});

router.get("/paystack/callback", function(req, res){
    const ref = req.query.reference;
    verifyPayment(ref, function(error,body){
        if(error){
            //handle errors appropriately
            console.log(error);
            return res.redirect("/shop/error");
        }
       const response = JSON.parse(body);
       console.log(response);
        // let data = _.at(response.data, ['amount','customer.email', 'metadata.full_name', 'metadata.phone_number', 'metadata.address']);
        // console.log(data);
         
        //  [ amount, email, full_name, phone_number, address]  =  data;
        
        const order = new Order({
          user: req.user,
          cart: req.session.cart,
          amount: response.data.amount,
          email: response.data.customer.email,
          full_name: response.data.metadata.full_name,
          phone_number: response.data.metadata.phone_number,
          address: response.data.metadata.address,
          reference: response.data.reference
          // paid_At:response.data.paid_at
          
         });

        order.save().then((order)=>{
            if(!order){
                console.log(e);
                res.redirect("/shop/error");
            }
            console.log(order);
            res.redirect("/shop/receipt/"+ order._id);
        }).catch(function(e){
            console.log(e);
            res.redirect("/shop/error");
       });
    });
});

router.get("/receipt/:id", (req, res)=>{
    const id = req.params.id;
    Order.findById(id).then((order)=>{
        if(!order){
            //handle error when the order is not found
            res.redirect("/shop/error");
        }

        req.session.cart = null;
         req.flash("success", order.full_name + " your payment of NGN" + order.amount/100 +  " was successful." + "Kindly check your mail for your receipt of payment"  );
         res.redirect('/books');

        // res.render("paystackMsg/success",{order:order});
    }).catch((e)=>{
        res.redirect('/shop/error');
    });
});
router.get("/error", (req, res)=>{
    res.render('paystackMsg/error');
});



router.get("/add-to-cart/:id", (req, res) => {

  const BookId =  req.params.id;
  const cart =  new Cart(req.session.cart ? req.session.cart : {});

  Book.findById(BookId, function(err, book){
    if(err){
    	console.log(err);
      return res.redirect('/books');
    }
    cart.add(book, book.id);
    req.session.cart = cart;
    res.redirect('back');
  });
});
 // reduce items in cart by 0ne
router.get("/reduce/:id", (req, res) => {
		const bookId = req.params.id;
		const cart =  new Cart(req.session.cart ? req.session.cart : {});
 		
 		cart.reduceByOne(bookId);
 		req.session.cart = cart;
 		res.redirect('/shop/shopping-cart');
});
// remove all items in cart
router.get("/remove/:id", (req, res) => {
		const bookId = req.params.id;
		const cart =  new Cart(req.session.cart ? req.session.cart : {});
 		
 		cart.removeItem(bookId);
 		req.session.cart = cart;
 		res.redirect('/shop/shopping-cart');
});

 // increase items in cart by 0ne
router.get("/increase/:id", (req, res) => {
		const bookId = req.params.id;
		const cart =  new Cart(req.session.cart ? req.session.cart : {});
 		
 		cart.increaseByOne(bookId);
 		req.session.cart = cart;
 		res.redirect('/shop/shopping-cart');
});


router.get("/checkout", isLoggedIns,  function(req, res, next){
   if(!req.session.cart){
      return res.render("shop/shopping-cart");
    }

     const cart = new Cart(req.session.cart);
     res.render("shop/checkout", {total: cart.totalPrice});
});


router.get("/allorders", isLoggedIns, middleware.adminAccess, async (req, res, next) =>{

  try{
     const orders = await Order.find().limit(2).sort({paid_At: 'desc'});
      const myTotal = await Order.find();
     let cart;
      orders.forEach((order)=>{
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
       res.render("shop/orders", {orders : orders, myTotal:myTotal});
  }catch(err){
           if (err){
        console.log(err);
      }
  }
});

// ajax call
router.get("/get-orders/:page/:limit", async (req, res) => {
  const page = req.params.page
  const limit =req.params.limit

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  try{

      let orders = await Order.find().skip(parseInt(startIndex)).limit(parseInt(limit)).sort({paid_At: 'desc'});
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
 
})






function isLoggedIns (req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/users/login");
}



module.exports = router;