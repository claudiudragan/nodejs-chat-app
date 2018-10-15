let mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

//Message Schema
let groupsSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    admin:{
      type: ObjectId,
      required: true
    },
    picture:{
      type: String,
      required: true
    },
    members:{
      type: [ObjectId],
      required: true
    }
});

let Groups = module.exports = mongoose.model('Groups', groupsSchema);
