'use strict';

import test from 'ava';
import sinon from 'sinon';
import Bot from '../lib/index.js';

test('should create url button', t => {
  let bot = new Bot(123);
  let title = 'Test';
  let url = 'http://google.com';
  let button = bot.createWebUrlButton(title, url);
  t.deepEqual(button, {
    type: 'web_url',
    title: title,
    url: url
  });
});

test('should create postback button', t => {
  let bot = new Bot(123);
  let title = 'Test';
  let payload = 'USER_DEFINED_PAYLOAD';
  let button = bot.createPostbackButton(title, payload);
  t.deepEqual({
    type: 'postback',
    title: title,
    payload: payload
  }, button);
});

test('should create generic element', t => {
  let bot = new Bot(123);
  let title = 'title';
  let itemUrl = 'item url';
  let imageUrl = 'image url';
  let subtitle = 'subtitle';
  let buttons = Array(1,2,3);
  t.throws(bot.createGenericElement, 'Generic element requires title and at least one other field (image url, subtitle or buttons) is required with non-empty value');
  t.throws(() => {bot.createGenericElement('test', 'item url')}, 'Generic element requires title and at least one other field (image url, subtitle or buttons) is required with non-empty value');
  t.deepEqual(bot.createGenericElement(title, itemUrl, imageUrl, subtitle, buttons), {
    title: title,
    item_url: itemUrl,
    image_url: imageUrl,
    subtitle: subtitle,
    buttons: buttons
  });
  t.deepEqual(bot.createGenericElement(title, itemUrl, imageUrl, subtitle, 'hi'), {
    title: title,
    item_url: itemUrl,
    image_url: imageUrl,
    subtitle: subtitle
  });
});

test('should create generic template', t => {
  let bot = new Bot(123);
  t.throws(bot.createGenericTemplate, 'Generic template requires an array of elements');
  t.deepEqual(bot.createGenericTemplate([1,2,3]), {
    template_type: 'generic',
    elements: [1,2,3]
  });
});

test('should create button template', t => {
  let bot = new Bot(123);
  t.deepEqual(bot.createButtonTemplate(), {
    template_type: 'button'
  });
  t.deepEqual(bot.createButtonTemplate(null, [1,2,3]), {
    template_type: 'button',
    buttons: [1,2,3]
  });
  t.deepEqual(bot.createButtonTemplate('test', null), {
    template_type: 'button',
    text: 'test'
  });
  t.deepEqual(bot.createButtonTemplate('test', [1,2,3]), {
    template_type: 'button',
    text: 'test',
    buttons: [1,2,3]
  });
});

test('should send attachment', t => {
  let bot = new Bot(123);
  bot.send = sinon.spy();
  bot.sendAttachment(123, 'test', {some: 'payload'});
  t.true(bot.send.calledWith(123, {
    attachment: {
      type: 'test',
      payload: {
        some: 'payload'
      }
    }
  }));
});

test('should send image attachment', t => {
  let bot = new Bot(123);
  bot.send = sinon.spy();
  bot.sendImage(123, 'test');
  t.true(bot.send.calledWith(123, {
    attachment: {
      type: 'image',
      payload: {
        url: 'test'
      }
    }
  }));
});

test('should send text', t => {
  let bot = new Bot(123);
  bot.send = sinon.spy();
  bot.sendText(123, 'test');
  t.true(bot.send.calledWith(123, {
    text: 'test'
  }));
});

test.todo('should send remote');
test.todo('should spy send callback');
