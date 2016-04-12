### Install

```sh
npm install express-facebook-messenger
```

### Getting started

#### 1. [Setup a Facebook App and Page](https://developers.facebook.com/docs/messenger-platform/quickstart) and note down the generated page token.

#### 2. Build bot

```js
var express = require('express');
var bodyParser = require('body-parser');
var bot = require('../lib/')('<token>');


var app = express();

bot.on('message', function(senderId, msg){
  this.send(senderId, {
    text: 'Hello to you too!'
  });
});

app.use(bodyParser.json());

app.use('/hook', bot.router());

app.listen(5000);

```

### Example

To run the [example app](https://github.com/kelonye/express-facebook-messenger/tree/master/test/simple.js):
- Install [ngrok](https://ngrok.com)
- Start ngrok tunnel
```bash
ngrok http 5000
```
- Note the generated url and use it to add a webhook to your FB app.
- Run
```bash
TOKEN='<your page token>' node test/simple.js
```

### Contribute

Lmk ...
