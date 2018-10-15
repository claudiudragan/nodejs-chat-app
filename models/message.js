let mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

//Message Schema
let messageSchema = mongoose.Schema({
    sender:{
        type: ObjectId,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    },
    edited:{
      type: Boolean,
      required: true
    },
    group:{
      type: ObjectId,
      required: true
    }
});

let Message = module.exports = mongoose.model('Message', messageSchema);
