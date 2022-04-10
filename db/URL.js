const {Schema,model} = require("mongoose");

const urlSchema = new Schema({
    original_url: { type: String, required: true},
    short_url: { type: Number, required: true}
})

const URL = model('URL', urlSchema);

module.exports = URL;