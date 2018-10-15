const mongoose = require('mongoose');

//User Schema
const ObjectId = mongoose.Schema.Types.ObjectId;

const newUserSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  avatar:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  friends:{
    type: [ObjectId],
    required: false
  },
  groups:{
    type: [ObjectId],
    required: false
  }
});

const newUser = module.exports = mongoose.model('newUser', newUserSchema);
