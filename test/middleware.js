'use strict';

import test from 'ava';
import sinon from 'sinon';
import Bot from '../lib/index.js';

test('should throw no token error', t => {
  t.throws(() => { new Bot(); }, 'Token must be a string or object {validationToken: "", pageAccessToken: ""}');
});

test('should maintain token', t => {
  let token = 123;
  let bot = new Bot(token);
  t.is(bot._validationToken, token);
  t.is(bot._pageAccessToken, token);
});

test('should support different tokens', t => {
  let vToken = 123;
  let pToken = 321;
  let bot = new Bot({validationToken: vToken, pageAccessToken: pToken});
  t.is(bot._validationToken, vToken);
  t.is(bot._pageAccessToken, pToken);
});

test('should emit message-malformed if no messages are sent', t => {
  let bot = new Bot(123);
  let messageSpy = sinon.spy();
  let malformedMessageSpy = sinon.spy();

  bot.on('message', messageSpy);
  bot.on('message-malformed', malformedMessageSpy);
  bot._handleMessage({
    body: {}
  }, () => {
    t.false(messageSpy.calledOnce);
    t.true(malformedMessageSpy.calledOnce);
  });
});

test('should emit message-malformed if message contains no sender id', t => {
  let bot = new Bot(123);
  let messageSpy = sinon.spy();
  let malformedMessageSpy = sinon.spy();

  bot.on('message', messageSpy);
  bot.on('message-malformed', malformedMessageSpy);
  bot._handleMessage({
    body: {
      entry: [
        {
          messaging: [
            {
              sender: {
                
              }
            }
          ]
        }
      ]
    }
  }, () => {
    t.false(messageSpy.calledOnce);
    t.true(malformedMessageSpy.calledOnce);
  });
});

test('should emit message if it contains sender and body', t => {
  let bot = new Bot(123);
  let messageSpy = sinon.spy();
  let malformedMessageSpy = sinon.spy();
  let senderId = 123;
  let msg = 'Hi there!';

  bot.on('message', messageSpy);
  bot.on('message-malformed', malformedMessageSpy);
  bot._handleMessage({
    body: {
      entry: [
        {
          messaging: [
            {
              sender: {
                id: senderId
              },
              message: {
                text: msg
              }
            }
          ]
        }
      ]
    }
  }, () => {
    t.true(messageSpy.calledWith(senderId, {
      text: msg,
    }));
    t.false(malformedMessageSpy.calledOnce);
  });
});

test('should emit multiple messages', t => {
  let bot = new Bot(123);
  let messageSpy = sinon.spy();
  let malformedMessageSpy = sinon.spy();
  let sender1 = {
    id: 123
  };
  let sender2 = {
    id: 123
  };
  let msg1 = {
    text: 'Hi there!'
  };
  let msg2 = {
    text: 'Hi there 2!'
  };

  bot.on('message', messageSpy);
  bot.on('message-malformed', malformedMessageSpy);
  bot._handleMessage({
    body: {
      entry: [
        {
          messaging: [
            {
              sender: sender1,
              message: msg1,
            },
            {
              sender: sender2,
              message: msg2,
            }
          ]
        }
      ]
    }
  }, () => {
    t.true(messageSpy.calledTwice);
    t.true(messageSpy.calledWith(sender1.id, msg1));
    t.true(messageSpy.calledWith(sender2.id, msg2));
    t.false(malformedMessageSpy.calledOnce);
  });
});

test.todo('should handle routes');
