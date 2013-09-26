var express = require('express');
var app = express();

var mongoose = require('mongoose');

mongoose.connect('localhost', 'test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});


// Setup CORS related headers
var corsSettings = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
  // deal with OPTIONS method during a preflight request
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
}

app.use(express.bodyParser());
app.use(corsSettings);

var commentSchema = mongoose.Schema({
  author: { type: String, required: true },
  message: { type: String, required: true},
  upvotes: {type: Number, required: false},
  time: { type: Date, default: Date.now }
});
  
var Comment  = mongoose.model('Comment', commentSchema);

app.get('/comments', listComments);
app.post('/comments', createComment);
app.delete('/comments/:id', deleteCommentById);
app.put('/comments/:id', updateCommentById);

function listComments(req, res) {
  var options = {};
  if (req.query.skip) {
    options.skip = req.query.skip;
  }
  if (req.query.limit) {
    options.limit = req.query.limit;
  }
  Comment.find(null, null, options, function (err, docs) {
    if (err) {
      console.log(err);
      res.send(500, err);
    } else {
      res.send(200, docs);
    }
  });
}

function createComment(req, res) {
  Comment.create(req.body, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(500, err);
    } else {
      console.log('Added to db');
      res.send(200, doc);
    }
  });
}

function deleteCommentById(req, res) {
  var id = req.params.id;
  Comment.findByIdAndRemove(id, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(404, err);
    } else {
      res.send(200, doc);
    }
  })
}

function updateCommentById(req, res) {
  var id = req.params.id;
  var newData = {
    author: req.body.name,
    message: req.body.message,
    upvotes: req.body.upvotes
  };
  Comment.findByIdAndUpdate(id, newData, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(404, err);
    } else {
      res.send(200, doc);
    }
  });
}

app.listen(9090, function() {
  console.log('Express server listening on port 9090');
});

