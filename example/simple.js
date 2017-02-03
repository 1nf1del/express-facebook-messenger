/**
  * Module dependencies.
  */
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var bot = require('../lib/')({
  validationToken: process.env.VALIDATION_TOKEN,
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
});

bot.on('message', function(senderId, msg){
  this.send(senderId, {
    text: 'Hello to you too!'
  });
});

var app = express();

app.use(bodyParser.json());

app.use('/hook', bot.router());

app.listen(5000);
console.log('started app on port 5000');
