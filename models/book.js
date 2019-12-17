

const mongoose = require("mongoose");
// var Comment = require("./comment");
const Review = require("./review");


const BooksSchema =  new mongoose.Schema({
    image: {type:String, required:true},
    imageId: String,
    image_1: String,
    imageId_1: String,
    image_2: String,
    imageId_2: String,
    book_title: {type:String, required:true},
    description: {type:String, required:true},
    availability: String,
   price: { type: Number, required:true, default: 0},
    reviews: [
		    {
		         type: mongoose.Schema.Types.ObjectId,
		         ref: "Review"
		    }

    ],
    category:{
         
			type: mongoose.Schema.Types.ObjectId,
			required:true,
			ref: "Category",
			name: String
    },

   rating: {
        type: Number,
        default: 0
    },

    createdAt: {
    	type:Date,
    	required: true,
    	default: Date.now
    }
});
 // BooksSchema.virtual('coverImagePath').get(function(){
 // 	if(this.coverImage != null && this.coverImageType != null){
 // 		return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
 // 	}
 // });

module.exports = mongoose.model("Books", BooksSchema);