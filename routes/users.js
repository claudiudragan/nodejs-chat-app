const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');



//Bring the User model in
let newUser = require('../models/newUser');

//Bring the Group model in
let Groups = require('../models/groups');

//Message model
let Messages = require('../models/message');

//Registration form
router.get('/register', function(req, res){
  res.render('register');
});

//Registration proccess

router.post('/register', function(req, res){
  const username = req.body.username;
  const email = req.body.email;
  const pass = req.body.password;
  const pass2 = req.body.password2;
  const avatar = "/avatar/everyone.png";

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid.').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    });
  }else{
    users = newUser.findOne({username: username}, function(err, result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        res.render('register', {inUse: "Username already in use."});
      }else{
        let newUsr = new newUser({
          username: username,
          avatar: avatar,
          email: email,
          password: pass
        });

        bcrypt.genSalt(10, function(err, salt){
          bcrypt.hash(newUsr.password, salt, function(err, hash){
            if(err){
              console.log(err);
            }

            newUsr.password = hash;

            newUsr.save(function(err, usr){
              if(err){
                console.log(err);
                return;
              }else{
                let update = {'$push': {members: usr._id}};
                Groups.findByIdAndUpdate(mongoose.Types.ObjectId('5a4409cdff93a20f0044552a'), update, function(err, grp){
                  if(err){
                    console.log(err);
                    return;
                  }else{
                    console.log("Added " + newUsr.username + " to default group.");
                  }
                });

                req.flash('success', 'You are now registered and can login');
                res.redirect('/');
              }
            });
          });
        });
      }
    });
  }
});

//Chat redirect
router.get('/chat/:groupId', function(req, res){

  if(req.user == null){
    res.redirect('/');
  }else{
    groups = Groups.find({members: req.user._id}, function(err, grp){
      if(err){
        console.log(err);
        return;
      }else{
        // console.log(req.params.groupId);
        messages = Messages.find({group: req.params.groupId}, function(err, msg){
          if(err){
            console.log(err);
            return;
          }else{
            usrs = newUser.find(function(err, usr){
              if(err){
                console.log(err);
                return;
              }else{
                res.render('chat', {currGroup: req.params.groupId, groups: grp, messages:msg, users: usr, friends: req.user.friends});
              }
            });
          }
        });
      }
    });
  }

});

//Settings
router.get('/settings', function(req, res){
  if(req.user == null){
    res.redirect('/');
  }else{
    res.render('settings');
  }
});

var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/avatar');
  },
  filename: function(req, file, callback){
    console.log(file);
    callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

router.post('/settings/', function(req, res){
  var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
    	var ext = path.extname(file.originalname);
    	if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    		return callback(res.render('/settings', {error: 'Only images are allowed'}), null);
    	}
    	callback(null, true);
    }
  }).single('file');
  upload(req, res, function(err){
    console.log("File uploaded");
    avatar = "/avatar/" + req.file.filename;

    newUser.findByIdAndUpdate(req.user._id, {avatar:avatar}, function(err){
      if(err){
        console.log(err);
        return;
      }
    });

    res.redirect('/');
  });
});

//Login form
router.get('/login', function(req, res){
  res.render('login');
});

//Login proccess
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/')
});

module.exports = router;
