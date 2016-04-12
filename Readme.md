### Install

```sh
npm install express-facebook-messenger
```

### Getting started

```js
var Bot = require('express-facebook-messenger');
var bot = new Bot('<token>');

bot.on('message', function(senderId, msg){
  this.send(senderId, {
    text: 'Hello to you too!'
  });  
});

app.use('/webhook', bot.router());
```

### Contribute

Please lmk anything I missed!
