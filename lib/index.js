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

  if (typeof token === 'string') {
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

  debug('got message', JSON.stringify(req.body, null, 2));

  var events = req.body.entry[0].messaging;
  for (i = 0; i < events.length; i++) {
    var event = events[i];
    var senderId = event.sender.id;
    if (event.message && event.message.text) {
      var msg = event.message.text;
      self.emit('message', senderId, msg);
    }
  }

  next();

};


Bot.prototype.send = function(senderId, msg){

  var self = this;

  debug('sending message to %s %s', senderId, JSON.stringify(msg, null, 2));

  request
    .post(SEND_URL)
    .type('json')
    .query({access_token: self._pageAccessToken})
    .send({
      recipient: {id: senderId},
      message: msg,
    })
    .end(function(err, response){
      // debug(response.body);
      if (err) return debug(err);
      debug('sent message %s', JSON.stringify(response.body, null, 2));
    });

};


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
