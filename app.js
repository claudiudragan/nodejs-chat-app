const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


mongoose.connect(config.database);

let db = mongoose.connection;

let Message = require('./models/message');

//Checking the connection
db.once('open', function(){
    console.log('\nConnected to the MongoDB database');
});

//Checking for errors in the DB
db.on('error', function(err){
    console.log(err);
});

//Initialise the app
const app = express();

//Initialise Socket.io
const server= http.createServer(app);
const io = require('socket.io')(server);

//Load groups model
Group = require('./models/groups')

//Load Template Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  // res.locals.groups = Group.find({req.user._id, function())
  next();
});

//Home Route
app.get('/', function(req, res){
  if(req.user == null){
    res.render('index');
  }else {
    gr = Group.findOne(function(err, grp){
      if(err){
        console.log(err);
        return;
      }else{
        res.redirect('/users/chat/' + grp._id);
      }
    });
  }
});

//Socket.io Stuff
io.on('connection', function(socket){
  socket.on('conn', function(userName, grId){
    console.log(userName + " connected to: " + grId);
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, usr, userId, time, edited, grpId, av){

    var grp = mongoose.Types.ObjectId(grpId);
    var uId = mongoose.Types.ObjectId(userId);

    let newMessage = new Message({
      sender: uId,
      body: msg,
      timestamp: time,
      edited: edited,
      group: grp
    });

    newMessage.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        console.log("Message from: " + usr);
        io.emit('chat message', msg, usr, uId, time, edited, grpId, av);
      }
    })


  });
});

//Route User
let users = require('./routes/users');
app.use('/users', users);

//Route Group
let group = require('./routes/groups');
app.use('/groups', group);


//Start the server
server.listen(3000, function(){
    console.log("\nServer started on port 3000...");
});
