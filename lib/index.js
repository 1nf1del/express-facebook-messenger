/**
 * Module dependencies.
 */
var debug = require('debug')('messenger');
var Emitter = require('events').EventEmitter;
var request = require('superagent');
var Router = require('express').Router;
var SEND_URL = 'https://graph.facebook.com/v2.6/me/messages';


module.exports = Bot;


function Bot(token){
  if (!(this instanceof Bot)) return new Bot(token);

  if (token && typeof token !== 'object') {
    this._validationToken = this._pageAccessToken = token;
  } else if (token && token.validationToken && token.pageAccessToken) {
    this._validationToken = token.validationToken;
    this._pageAccessToken = token.pageAccessToken;
  } else {
    throw new Error('Token must be a string or object {validationToken: "", pageAccessToken: ""}');
  }
  Emitter.call(this);
}


Bot.prototype.__proto__ = Emitter.prototype;


Bot.prototype._handleMessage = function(req, next){
  var self = this;
  var entry = req.body.entry;
  entry = Array.isArray(entry) && entry[0] ? entry[0] : false;
  var messaging = entry && entry.messaging && Array.isArray(entry.messaging) ? entry.messaging : false;

  debug('got message', JSON.stringify(req.body, null, 2));

  if (messaging) {
    messaging.forEach(function(event) {
      if (event.sender && event.sender.id && event.message) {
        self.emit('message', event.sender.id, event.message);
      } else {
        self.emit('message-malformed', req.body);
        debug('recieved malformed message', JSON.stringify(req.body, null));
      }
    });
  } else {
    self.emit('message-malformed', req.body);
    debug('recieved malformed message', JSON.stringify(req.body, null));
  }

  next();
};

Bot.prototype.middleware =
Bot.prototype.router = function(){

  var self = this;
  var router = Router();

  router.get('/', function(req, res, next) {
    if (req.query['hub.verify_token'] !== self._validationToken) next(new Error('wrong validation token'));
    res.send(req.query['hub.challenge']);
  });

  router.post('/', function(req, res) {
    self._handleMessage(req, function(err){
      if (err) return next(err);
      res.status(200).end();
    });
  });

  return router;

};

Bot.prototype.createWebUrlButton = function(title, url) {
  return {
    type: 'web_url',
    title: title,
    url: url
  };
};

Bot.prototype.createPostbackButton = function(title, payload) {
  return {
    type: 'postback',
    title: title,
    payload: payload
  };
};

Bot.prototype.createGenericElement = function(title, itemUrl, imageUrl, subtitle, buttons) {
  if (!title || !(imageUrl || subtitle || Array.isArray(buttons))) throw new Error('Generic element requires title and at least one other field (image url, subtitle or buttons) is required with non-empty value');
  var element = {
    title: title
  };
  if (itemUrl) element.item_url = itemUrl;
  if (imageUrl) element.image_url = imageUrl;
  if (subtitle) element.subtitle = subtitle;
  if (Array.isArray(buttons)) element.buttons = buttons;
  return element;
};

Bot.prototype.createGenericTemplate = function(elements) {
  if (!Array.isArray(elements)) throw new Error('Generic template requires an array of elements');
  return {
    template_type: 'generic',
    elements: elements
  };
};

Bot.prototype.createButtonTemplate = function(text, buttons) {
  var template = {
    template_type: 'button'
  };
  if (text) template.text = text;
  if (Array.isArray(buttons)) template.buttons = buttons;
  return template;
};

Bot.prototype.sendAttachment = function(senderId, type, payload, cb) {
  this.send(senderId, {
    attachment: {
      type: type,
      payload: payload
    }
  }, cb);
};

Bot.prototype.sendImage = function(senderId, imageUrl, cb) {
  this.sendAttachment(senderId, 'image',{
    url: imageUrl
  }, cb);
};

Bot.prototype.sendText = function(senderId, text, cb){
  this.send(senderId, {
    text: text
  }, cb);
};

Bot.prototype.send = function(senderId, msg, cb){

  var self = this;

  debug('sending message to %s %s', senderId, JSON.stringify(msg, null, 2));

  request
    .post(SEND_URL)
    .type('json')
    .query({access_token: self._pageAccessToken})
    .send({
      recipient: {id: senderId},
      message: msg
    })
    .end(function(err, response){
      if (err) return debug('sending message failed: ', response.text);
      debug('sent message %s', JSON.stringify(response.body, null, 2));
      if(typeof cb === 'function') cb(err, response);
    });

};
