const mongoose = require("mongoose");
const bookLimitSchema = new mongoose.Schema({
    book_limit: {type: String}
 });
module.exports = mongoose.model("BookLimit", bookLimitSchema);