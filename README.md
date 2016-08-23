MWBot
========================

## Description
MWBot is a Node.js module for interacting with the MediaWiki API.
The library makes use of the Promise Pattern and behind the scene, the [request](https://www.npmjs.com/package/request) library.

The design goal is to be as flexible as possible, with the ability to overwrite options and behaviour any option at any point.
The library also lets you freely choose the abstraction/convenience level on which you want to work.

The library has extensive test coverage and is written in modern ECMAScript 2015.

## Requirements
* Node.js 4.0+

## Technical API Documentation
* [API Documenatation](docs/API.md)

## Documentation
### Constructor and Settings
#### constructor(customOptions, customRequestOptions)
Constructs a new MWBot instance.
```js
let bot = new MWBot();
```

Construct with custom options:
```js
let bot = new MWBot({
    verbose: true
});
```
Construct with custom [request](https://www.npmjs.com/package/request) options
```js
let bot = new MWBot({}, {
    timeout: 160000
});
```

#### setOptions(customOptions)
Can be used to overwrite the default bot options
```js
bot.setOptions({
   verbose: false,  
   silent: false,
   defaultSummary: 'MWBot',
   concurrency: 1,
   apiUrl: false,
   sparqlEndpoint: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
});
````
#### setGlobalRequestOptions(customRequestOptions)
Overwrite [request](https://www.npmjs.com/package/request) options
```js
bot.setGlobalRequestOptions({
    method: 'POST',
    qs: {
        format: 'json'
    },
    form: {

    },
    timeout: 120000, // 120 seconds
    jar: true,
    time: true,
    json: true
})
```

### Login and Session Management
#### .login(loginOptions)
```js
bot.login({
  apiUrl: "http://localhost:8080/wiki01/api.php",
  username: "testuser",
  password: "testpassword"
}).then((response) => {
    // Logged In
}).catch((err) => {
    // Could not login
});
```

#### .getEditToken()
```js
bot.getEditToken().then((response) => {
    // Success
}).catch((err) => {
    // Error: Could not get edit token
});
````

#### loginGetEditToken(loginOptions)
Combines .login() and getEditToken() into one operation for convenience.

### CRUD Operations
#### create(title, content, summary, customRequestOptions)
```js
bot.create('Test Page', 'Test Content', 'Test Summary').then((response) => {
     // Success
 }).catch((err) => {
     // Error: Could not get edit token
 });
```
#### read(title, customRequestOptions)
```js
bot.create('Test Page', {timeout: 8000}).then((response) => {
    // Success
}).catch((err) => {
    // Error: Could not get edit token
});
```

#### update(title, content, summary, customRequestOptions)

#### edit(title, content, summary, customRequestOptions)

#### upload(title, pathToFile, comment, customParams, customRequestOptions)

#### uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions)

### Convenience Operations
#### batch(jobs, summary, concurrency, customRequestOptions)

#### sparqlQuery(query, endpointUrl, customRequestOptions)

#### askQuery(query, customRequestOptions)
* TODO


### Basic Requests
In case that the standard CRUD requests are not sufficient, it is possible to craft custom requests:

#### request(params, customRequestOptions)
This request assumes you're acting against a MediaWiki API.
It does basic error handling, memorizes tokens and the API URL.
```js
bot.request({
    action: 'edit',
    title: 'Main_Page',
    text: '=Some Wikitext 2=',
    summary: 'Test Edit',
    token: bot.editToken
}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```


#### rawRequest(requestOptions)
This executes a standard [request](https://www.npmjs.com/package/request) request.
It uses the some default requestOptions, but you can overwrite any of them.
Use this if you need full flexibility or do generic HTTP requests.
```js
bot.rawRequest({
    method: 'GET',
    uri: 'https://jsonplaceholder.typicode.com/comments',
    json: true,
    qs: {
        postId: 1
    }
}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

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

For more examples, take a look at the [/test](test/) directory
