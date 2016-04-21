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

test('should emit message-malformed', t => {
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

test('should not emit message or message-malformed', t => {
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
                id: 123
              }
            }
          ]
        }
      ]
    }
  }, () => {
    t.false(messageSpy.calledOnce);
    t.false(malformedMessageSpy.calledOnce);
  });
});

test('should emit message', t => {
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
    t.true(messageSpy.calledWith(senderId, msg));
    t.false(malformedMessageSpy.calledOnce);
  });
});

test('should emit multiple messages', t => {
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
            },
            {
              sender: {
                id: senderId + 2
              },
              message: {
                text: msg + 2
              }
            }
          ]
        }
      ]
    }
  }, () => {
    t.true(messageSpy.calledTwice);
    t.true(messageSpy.calledWith(senderId, msg));
    t.true(messageSpy.calledWith(senderId + 2, msg + 2));
    t.false(malformedMessageSpy.calledOnce);
  });
});

test.todo('should handle routes');
