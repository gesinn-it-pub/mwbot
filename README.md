
MWBot
========================
[![CI](https://github.com/gesinn-it-pub/mwbot/actions/workflows/ci.yml/badge.svg)](https://github.com/gesinn-it-pub/mwbot/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/gesinn-it-pub/mwbot/branch/master/graph/badge.svg?token=s0zci3GftF)](https://codecov.io/github/gesinn-it-pub/mwbot)
[![npm version](https://badge.fury.io/js/mwbot.svg)](https://badge.fury.io/js/mwbot)
![node-current](https://img.shields.io/node/v/mwbot)
![mw-version](https://img.shields.io/badge/MW-1.31--1.38-brightgreen)
![npm](https://img.shields.io/npm/dw/mwbot)

## Description
MWBot is a Node.js module for interacting with the MediaWiki API created and originally developed by [@Fannon](https://github.com/Fannon/).

The library makes use of the Promise pattern and behind the scene, the NPM [request](https://www.npmjs.com/package/request) library.

The design goal is to be as flexible as possible, with the ability to overwrite options and behaviour at any point.
The library also lets you freely choose the abstraction/convenience level on which you want to work.
You can use convenience functions that bundles (with concurrency) multiple API requests into one function, 
but you can also handcraft your own custom MediaWiki API and pure HTTP requests.

## Technical API Documentation
* [API Documenatation](docs/API.md)

## Documentation
Since this library is based on promise, it can be used either via the promise notation, or using async/await.

### Typical Example (Promise .then/.catch)
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

### Typical Example (async/await)
```js
async function main() {
    const bot = new MWBot({
        apiUrl: 'https://www.wikidata.org/w/api.php'
    });
    await bot.loginGetEditToken({
        username: …
        password: …
    });
    …
    for (const itemId of …) {
        await bot.request(…);
    }
}
// In the root scope of a script, you must use the promise notation, as await is not allowed there.
main().catch(console.error);
```

For more examples, read the documentation or have a look at the [/test](test/) directory

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
Overwrite/extend the default bot options
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
Overwrite/extend the [request](https://www.npmjs.com/package/request) options
This may be important for more advanced usecases, 
e.g. changing the user agent or adding additional authentification or certificates.
```js
bot.setGlobalRequestOptions({
    method: 'POST',
    qs: {
        format: 'json'
    },
    headers: {
        'User-Agent': 'mwbot/1.0.3'
    },
    timeout: 120000, // 120 seconds
    jar: true,
    time: true,
    json: true
})
```

### Login and Session Management
Login with user and password.
This will be necessary for most bot actions. 
A successful login will add the login token to the bot state.
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
Fetches an edit token that is needed for certain MediaWiki API actions, like editing pages.
```js
bot.getEditToken().then((response) => {
    // Success
}).catch((err) => {
    // Error: Could not get edit token
});
````

#### loginGetEditToken(loginOptions)
Combines .login() and getEditToken() into one operation for convenience.

#### setApiUrl(apiUrl)
If no login is necessary for the bot actions, it is sufficient to just set the API URL instead of loggin in.
```js
bot.setApiUrl('https://www.semantic-mediawiki.org/w/api.php');
```

Note that it is also possible to set the API URL with the constructor:
```js
let bot = new MWBot({
    apiUrl: 'https://www.semantic-mediawiki.org/w/api.php'
});
```

### CRUD Operations
#### create(title, content, summary, customRequestOptions)
Creates a wiki page. If the page already exists, it will fail
* See https://www.mediawiki.org/wiki/API:Edit
```js
bot.create('Test Page', 'Test Content', 'Test Summary').then((response) => {
    // Success
}).catch((err) => {
    // General error, or: page already exists
});

// Or simpler in async/await
try {
  const response = await bot.create('Test Page', 'Test Content', 'Test Summary');
} catch (err) {
  // General error, or: page already exists
}
```

#### read(title, customRequestOptions)
Reads the content of a wiki page. 
To fetch more than one page, separate the page names with `|`
* See https://www.mediawiki.org/wiki/API:Query
```js
bot.read('Test Page|MediaWiki:Sidebar', {timeout: 8000}).then((response) => {
    // Success
    // The MediaWiki API Result is somewhat unwieldy:
    console.log(response.query.pages['1']['revisions'][0]['*']);
}).catch((err) => {
    // Error
});
```

#### readWithProps(title, props, redirect, customRequestOptions)
Reads the content and meta-data of one (or many) wikipages based on specific parameters.
To fetch more than one page, separate the page names with `|`. To define multiple props separate them also with `|`.
* See https://www.mediawiki.org/wiki/API:Query
```js
bot.readWithProps('Test Page|MediaWiki:Sidebar', 'user|userid|content', true, {timeout: 8000}).then((response) => {
    // Success
    console.log(response.query.pages['1']['revisions'][0]['*']);
}).catch((err) => {
    // Error
});
```

#### update(title, content, summary, customRequestOptions)
Updates a wiki page. If the page doesn't exist, it will fail. 
* See https://www.mediawiki.org/wiki/API:Edit
```js
bot.update('Test Page', 'Test Content', 'Test Summary').then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

#### edit(title, content, summary, customRequestOptions)
Edits a wiki page. If the page does not exist yet, it will be created.
* See https://www.mediawiki.org/wiki/API:Edit
```js
bot.edit('Test Page', 'Test Content', 'Test Summary').then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

#### upload(title, pathToFile, comment, customParams, customRequestOptions)
Upload a file to the wiki. If the file exists, it will be skipped.
Make sure your wiki is [configured correctly](https://www.mediawiki.org/wiki/Manual:Configuring_file_uploads) for file uploads
```js
bot.upload(false, __dirname + '/mocking/example1.png')}).then((response) => {
  // Success
}).catch((err) => {
  // Error
});
```

#### uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions)
Like upload(), but will overwrite files on the server

### Convenience Operations
#### batch(jobs, summary, concurrency, customRequestOptions)
This function allows to work more conveniently with the MediaWiki API. 
It combines all CRUD operations and additionally manages concurrency, logging, error handling, etc.

```js
let batchJobs = {
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
};

bot.batch(batchJobs, 'Batch Upload Summary').then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

Alternatively, an array.array notation can be used. 
The first array item is the operation name, the second declares the page name.
All following array items are used as function parameters.

```js
bot.loginGetEditToken(loginCredentials.valid).then(() => {
    return bot.batch([
        [
            'create',
            'TestPage1',
            'TestContent1',
            'Batch Upload Reason'
        ],
        [
            'update',
            'TestPage1',
            'TestContent1-Update',
            'Batch Upload Reason'
        ],
        [
            'delete',
            'TestPage1',
            'Batch Upload Reason'
        ]
    ], false, 1);

}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```


#### sparqlQuery(query, endpointUrl, customRequestOptions)
Query Triplestores / SPARQL Endpoints like those from wikidata and dbpedia.

```js
let endPoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';
let query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX wikibase: <http://wikiba.se/ontology#>

    SELECT ?catLabel WHERE {
        ?cat  wdt:P31 wd:Q146 .

        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
`;

bot.sparqlQuery(query, endPoint).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

#### askQuery(query, customRequestOptions)
```js
let apiUrl = 'https://www.semantic-mediawiki.org/w/api.php';
let query = `
    [[Category:City]]
    [[Located in::Germany]] 
    |?Population 
    |?Area#km² = Size in km²
`;

bot.askQuery(query, apiUrl).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

### Basic Requests
In case that the standard CRUD requests are not sufficient, it is possible to craft custom requests:

#### request(params, customRequestOptions)
This request assumes you're acting against a MediaWiki API.
It allows you to easily craft custom MediaWiki API Request.
It also does basic error handling, and uses the login data if given.
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

### Helper Functions
#### MWBot.logStatus(status, currentCounter, totalCounter, operation, pageName, reason)
Static function that prints "pretty" upload status log messages.
Is used internally to print .batch() status messages.
```js
MWBot.logStatus('[+] ', counter, total, 'USER', user.userName);
```
#### MWBot.Promise
Injection of a [bluebird.js Promise](http://bluebirdjs.com/docs/getting-started.html) 

#### MWBot.map
Injection of a [bluebird.js Promise.map](http://bluebirdjs.com/docs/api/promise.map.html) (for concurrent batch requests)

#### MWBot.mapSeries
Injection of a [bluebird.js Promise.mapSeries](http://bluebirdjs.com/docs/api/promise.mapseries.html) (for sequential batch requests)


## Tips and Tricks
Learn how to use the Promise Pattern! 
It handles a lot, like concurrency, parallel or sequential requests, etc.

I can recommend the [bluebird.js](http://bluebirdjs.com/) Promise library.
This is the Promise library that mwbot is using internally, too.

* If you want to do batch request concurrently, use [Promise.map](http://bluebirdjs.com/docs/api/promise.map.html)
* If you want to do batch request in strictly sequential order, use [Promise.mapSeries](http://bluebirdjs.com/docs/api/mapseries.html)

## Complete Examples
### Fetch content of a page, change it and upload the changed page
```js
let bot = new MWBot();
bot.loginGetEditToken({
    apiUrl: "http://localhost:8080/wiki01/api.php",
    username: "testuser",
    password: "testpassword"
}).then(() => {
    return bot.read('Main Page');
}).then((response) => {
    let pageContent = response.query.pages['1']['revisions'][0]['*'];
    pageContent += ' Appendix';
    return bot.update('Main Page', pageContent);
}).then((response) => {
    // Success
}).catch((err) => {
    // Error
});
```

### Concurrent execution of batch jobs with bluebird.js Promise.map
This example takes a list of pages and executes a purge action on it.
It also demonstrates how to (re)use the static MWBot.logStatus helper function
* See http://bluebirdjs.com/docs/api/promise.map.html
```js
let bot = new MWBot();

let pages = [
    'Main Page',
    'Test Page'
];

let pagesTotal = pages.length || 0;
let pageCounter = 0;

bot.loginGetEditToken({
    apiUrl: "http://localhost:8080/wiki01/api.php",
    username: "testuser",
    password: "testpassword"
}).then(() => {

    return MWBot.map(pages, (page) => {

        pageCounter += 1;

        return bot.request({
            action: 'purge',
            titles: page,
            forcelinkupdate: true
        }).then((response) => {

            // Use MWBot.logStatus helper function
            if (response.error) {
                MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
            } else {
                MWBot.logStatus('[=] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
            }
        }).catch((err) => {
            MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', page);
            log(err);
        });

    }, {
        concurrency: 2
    }).then((response) => {
        // Success
    }).catch((err) => {
        // Error
    });

}).catch((err) => {
    // Login Error
});
```

## Testing

To run CI locally, use `make ci` or `NODE_VERSION=16 MW_VERSION=1.38 make ci`.

To develop against a running Wiki, run
```sh
# start wiki
$ make up
# run the node container
$ make bash
# run tests inside the container
> npm test
> ...
# finally exit
> exit
# and shutdown the wiki again 
$ make down
```
