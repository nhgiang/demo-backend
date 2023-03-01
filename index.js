var express = require('express');
var cors = require('cors');
var multer = require('multer');
var path = require('path');
var { v4: uuidv4 } = require('uuid')
var os = require("os")
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/admin');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  phone: String,
  email: String,
  video: String,
  image: String
});
const User = mongoose.model('User', userSchema);

var app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use('/uploads', express.static('./uploads'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '.' + file.originalname.split('.')[1])
  }
})

var upload = multer({ storage: storage }).single('file')

//ROUTES WILL GO HERE
app.post('/uploadfile', (req, res, next) => {
  upload(req, res, () => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    res.status(200).send({
      path: 'uploads/' + req.file.filename,
    });
  });
})

app.post('/create', async (req, res, next) => {
  const user = new User(req.body);
  const result = await user.save()
  res.status(200).send(result);
})

app.get('/get_list', async (req, res, next) => {
  const users = await User.find();
  res.status(200).send(users);
})

app.listen(3000, () => {

  console.log('Server started on port 3000')
});