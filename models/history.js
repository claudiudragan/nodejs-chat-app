let mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

//Message Schema
let historySchema = mongoose.Schema({
    group:{
      type: ObjectId,
      required: true
    },
    messages:{
        type: [ObjectId],
        required: false
    }
});

let History = module.exports = mongoose.model('History', historySchema);
