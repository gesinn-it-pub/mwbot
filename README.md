#MWBot
## Description
MWBot is a Node.js NPM module for interacting with the MediaWiki API.
It uses Promises and is written using modern ES6.
The design goal is to be as flexible as possible, with the ability to overwrite any option at any point. 
The library also lets you choose the abstraction/convenience level on which you want to work.

## Requirements
* Node.js 4.0+

## Examples
```js
const MWBot = require('mwbot');

let bot = new MWBot();

bot.loginGetEditToken(loginCredentials.valid).then(() => {
    return bot.edit('Test Page', '=Some more Wikitext=', 'Test Upload');
}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

For more examples please take a look at the /test/ directory
