MWBot
========================

## Description
MWBot is a Node.js module for interacting with the MediaWiki API.
The design goal is to be as flexible as possible, with the ability to overwrite options and behaviour any option at any point.
The library also lets you freely choose the abstraction/convenience level on which you want to work.

The library uses the Promise Pattern, understanding it is essential.

## Requirements
* Node.js 4.0+

## Technical API Documentation
* [API Documenatation](API.md)

## Documentation
### Constructor and Settings

#### constructor(customOptions)
#### setOptions(customOptions)
#### setGlobalRequestOptions(customRequestOptions)


### Login and Session Management

#### .login(loginOptions)

#### .getEditToken()

#### loginGetEditToken(loginOptions)

### Basic Requests
#### rawRequest(requestOptions)
#### request(params, customRequestOptions)

### CRUD Operations
#### create(title, content, summary, customRequestOptions)
#### read(title, customRequestOptions)

#### update(title, content, summary, customRequestOptions)

#### edit(title, content, summary, customRequestOptions)

#### upload(title, pathToFile, comment, customParams, customRequestOptions)

#### uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions)

### Convenience Operations
#### batch(jobs, summary, concurrency, customRequestOptions)

#### sparqlQuery(query, endpointUrl, customRequestOptions)

#### askQuery(query, customRequestOptions)
* TODO


## Complete Examples
### Single Requests, chained with .then
```js
const MWBot = require('mwbot');

let bot = new MWBot();

bot.loginGetEditToken({
    apiUrl: settings.apiUrl,
    username: settings.username,
    password: settings.password
}).then(() => {
    return bot.edit('Test Page', '=Some more Wikitext=', 'Test Upload');
}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});


```
### Batch Request
```js
let loginSettings = {
    apiUrl: settings.apiUrl,
    username: settings.username,
    password: settings.password
};

bot.loginGetEditToken(loginSettings).then(() => {
    return bot.batch({
        create: {
            'TestPage1': 'TestContent1',
            'TestPage2': 'TestContent2'
        },
        update: {
            'TestPage1': 'TestContent1-Update'
        },
        delete: [
            'TestPage2'
        ],
        edit: {
            'TestPage2': 'TestContent2',
            'TestPage3': Math.random()
        },
        upload: {
            'Image1.png': '/path/to/Image1.png'
        }
    }, 'Batch Upload Reason');

}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

For more examples please take a look at the /test/ directory
