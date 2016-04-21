/**
  * Module dependencies.
  */
var express = require('express');
var bodyParser = require('body-parser');
var bot = require('../lib/')(process.env.TOKEN);
var steed = require('steed');

bot.on('message', function(senderId, msg) {
  var bot = this;
  steed.series([
    (cb) => { bot.sendText(senderId, 'Hello to you too!', cb); },
    (cb) => { bot.sendImage(senderId, 'https://media.giphy.com/media/hmDutUmwiZgcw/giphy.gif', cb); },
    (cb) => {
      var buttonTemplate = bot.createButtonTemplate('Do you like buttons?', [
        bot.createWebUrlButton('Yes I love buttons!', 'http://giphy.com/gifs/upvote-elevator-buttons-144AvcWy0GA5Vu'),
        bot.createPostbackButton('No keep them away!', 'DOES_NOT_LIKE_BUTTONS')
      ]);
      bot.sendAttachment(senderId, 'template', buttonTemplate, cb);
    },
    (cb) => {
      var genericElements = [
        // All possible title + combinations
        bot.createGenericElement('Gif is not clickable', null, 'https://media.giphy.com/media/xThuWfWhRaxfngUViw/giphy.gif'),
        bot.createGenericElement('Gif is not clickable', null, null, 'Subtitle yo!'),
        bot.createGenericElement('Gif is not clickable', null, null, null, [
          bot.createWebUrlButton('OMG Yes!', 'http://giphy.com/gifs/upvote-elevator-buttons-144AvcWy0GA5Vu'),
          bot.createPostbackButton('Nooooooo!', 'DOES_NOT_LIKE_BUTTONS')
        ]),

        // No image
        bot.createGenericElement('Click to goto Google', 'http://google.com', null, 'Subtitle yo!'),
        bot.createGenericElement('Click to goto Google', 'http://google.com', null, null, [
          bot.createWebUrlButton('OMG Yes!', 'http://giphy.com/gifs/upvote-elevator-buttons-144AvcWy0GA5Vu'),
          bot.createPostbackButton('Nooooooo!', 'DOES_NOT_LIKE_BUTTONS')
        ]),

        // No button
        bot.createGenericElement('Click to view gif', 'http://giphy.com/gifs/cravetvcanada-cravetv-30rock-3o7WTw98KXEp06c4YE', 'https://media.giphy.com/media/3o7WTw98KXEp06c4YE/giphy.gif', 'Subtitle yo!'),
        // Everything
        bot.createGenericElement('Like this gif?', 'http://giphy.com/gifs/cravetvcanada-broad-city-abbi-jacobson-cravetv-l2JJwW9qxvYEKrCso', 'https://media.giphy.com/media/l2JJwW9qxvYEKrCso/giphy.gif', 'Subtitle yo!', [
          bot.createWebUrlButton('OMG Yes!', 'http://giphy.com/gifs/upvote-elevator-buttons-144AvcWy0GA5Vu'),
          bot.createPostbackButton('Nooooooo!', 'DOES_NOT_LIKE_BUTTONS')
        ]),
      ];

      var genericTemplate = bot.createGenericTemplate(genericElements);
      bot.sendAttachment(senderId, 'template', genericTemplate, cb);
    }
  ], (err, results) => {

  });
});

var app = express();

app.use(bodyParser.json());

app.use('/hook', bot.router());

app.listen(5000);
console.log('started app on port 5000');
