if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const cookieParser =require("cookie-parser");
const csrf = require('csurf');
const bodyParser = require("body-parser");
const mongoose    = require("mongoose");
const  flash       = require("connect-flash");
const { check, validationResult } = require('express-validator');
 const    expressSanitizer = require("express-sanitizer");
const session    = require("express-session");
const passport    = require("passport");
const LocalStrategy = require("passport-local").Strategy; 
const MongoStore = require('connect-mongo')(session);
const methodOverride = require("method-override");
const    User        = require("./models/users");
const Category = require("./models/category");
const Book = require("./models/book");
const Review = require("./models/review");
// const Rating = require("./models/rating");


const indexRoutes      = require("./routes/index");
const categoryRoutes  = require("./routes/category");
const  reviewRoutes  = require("./routes/review");
const  bookRoutes  = require("./routes/book");
// const ratingRoutes     = require("./routes/rating");
const shoppingRoutes     = require("./routes/shopping"); 



 const url = process.env.DATABASE_URL || "mongodb://localhost:27017/jerequeStore";
mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true },  function(err){
	if (err){
		console.error('system could not connect to mongo server.');
		console.log(err);
	} else{
		console.log('Data base connection successful!');
	}
});

// require the config passport 
 require('./config/passport')(passport);

// app sets and use
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(expressLayouts);



//require moment
app.locals.moment = require('moment');


// PASSPORT CONFIGURATION
app.use(session({
    secret: "here we go again!", 
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {maxAge: 180*60*1000}
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
 // passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
app.locals.moment = require('moment');

app.use(csrf());
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.session = req.session;
   res.locals.csrfToken = req.csrfToken();
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});



app.use("/", indexRoutes);
app.use("/category", categoryRoutes);
app.use("/shop", shoppingRoutes);
app.use("/books", bookRoutes);
// app.use("/books/:id/ratings", ratingRoutes);
app.use("/books/:id/reviews", reviewRoutes);




let port = process.env.PORT;
if(port == null || port == " "){
    port = 3000;
}

app.listen(port, function(){
   console.log("Your Ecom_bookstore Server Has Started!");
});
