// const mongoose = require("mongoose");
// const passportLocalMongoose = require("passport-local-mongoose");
//  // var bcrypt = require("bcrypt-nodejs");

// const UserSchema = new mongoose.Schema({
//     username: {type:String, required:true, unique:true},
//     email: {type:String, required:true, unique:true},
//     password: String,
//     createdAt: {type:Date,required: true, default: Date.now}
// });
// // UserSchema.methods.encryptPassword = function(password){
// // 	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// // };
// // UserSchema.methods.validPassword = function(password){
// // 	return bcrypt.compareSync(password, this.password);
// // };

//   UserSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model("User", UserSchema);

// const mongoose = require("mongoose");

// const bcrypt = require("bcrypt-nodejs");

// const UserSchema = new mongoose.Schema({
//     email: {type:String, required:true, unique:true},
//     firstName: {type:String, required:true},
//     lastName: {type:String},
//     password: String,
//     createdAt: {type:Date,required: true, default: Date.now}
// });
// UserSchema.methods.encryptPassword = function(password){
// 	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// };
// UserSchema.methods.validPassword = function(password){
// 	return bcrypt.compareSync(password, this.password);
// };

 

// module.exports = mongoose.model("User", UserSchema);

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    firstName: {type:String, required:true},
    lastName: {type:String, required: true},
    isAdmin: {type:Boolean, default: false},
    password: String,
    resetPasswordToken: {type:String},
    resetPasswordExpires: Date,
    createdAt: {type:Date,required: true, default: Date.now}
});
 
 UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);