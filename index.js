var express = require('express');
var cors = require('cors');
var multer = require('multer');
var path = require('path');
var { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser');
const fs = require('fs');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const randomEmail = require('random-email');

const customConfig = {
  dictionaries: [adjectives, colors, animals],
  separator: ' ',
  length: 2,
};


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/admin');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: String,
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

app.get('/generate', async (req, res, next) => {
  const testFolder = './uploads';
  const files = await fs.readdirSync(testFolder);
  const users = files.map(file => {
    const shortName = uniqueNamesGenerator(customConfig);
    const a = file.split('.')[file.split('.').length-1]
    const user = {
      fullName: shortName,
      password: '123456',
      phone: '' + createMobilePhoneNumber(),
      email: randomEmail({ domain: 'gmail.com' }),
    }
    if (['avif','gif','jpg','jpeg','png','svg'].includes(a)) user.image = 'uploads/' + file
    else if (['mp4','m4v','wmv','flv','vob','3gp'].includes(a)) user.video = 'uploads/' + file
    return user
  });
  const result = await User.insertMany(users)
  res.status(200).send(result);
})

app.listen(3000, async () => {


  console.log('Server started on port 3000')
});

const createMobilePhoneNumber = () => {
  const generator = new PhoneNumberGenerator();
  return generator.generatePhoneNumber();
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class PhoneNumberGenerator {
  constructor() {
    this.countryCode = +84;
    this.phoneNumberLength = 9;
  }

  generatePhoneNumber() {
    let phoneNumber = this.countryCode;
    for (let i = 0; i < this.phoneNumberLength; i++) {
      phoneNumber += getRandomInt(0, 9);
    }
    return phoneNumber;
  }
}

