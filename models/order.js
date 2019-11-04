const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
user: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "User"
},
cart: {
	type: Object,
	required: true,
},
full_name: {
    type: String,
    required: true,
},
email: {
    type: String,
    required: true,
},
phone_number: {
	type: Number,
	required: true,
},
address: {
	type: String,
	required:true,
},
amount: {
    type: Number,
    required: true,
},
reference: {
    type: String,
    required: true
},
paid_At: {type:Date,required: true, default: Date.now}
});

module.exports = mongoose.model("Order", orderSchema);