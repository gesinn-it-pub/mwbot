# MWBot

MWBot library

**Meta**

-   **author**: Simon Heimler

## version

Get mwbot ersion number

## setOptions

Set and overwrite msbot options

**Parameters**

-   `customOptions` **{}** 

## setGlobalRequestOptions

Sets and overwrites the raw request options, used by the "request" library
See <https://www.npmjs.com/package/request>

**Parameters**

-   `customRequestOptions` **{}** 

## setApiUrl

Convenience Method to set the API URL
This makes sense, when using requests that don't need a full login

**Parameters**

-   `apiUrl` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** e.g. '<https://www.semantic-mediawiki.org/w/api.php>'

## rawRequest

Executes a promisified raw request
Uses the npm request library

**Parameters**

-   `requestOptions` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **bluebird** 

## request

Executes a request with the ability to use custom parameters and custom request options

**Parameters**

-   `params` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Request Parameters
-   `customRequestOptions` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Custom request options

Returns **bluebird** 

## login

Executes a Login

**Parameters**

-   `loginOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## getEditToken

Gets an edit token
This is currently only compatible with MW >= 1.24

Returns **bluebird** 

## loginGetEditToken

Combines Login  with GetEditToken

**Parameters**

-   `loginOptions`  

Returns **bluebird** 

## create

Creates a new wiki pages. Does not edit existing ones

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `content` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `summary` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## read

Reads the content / and meta-data of one (or many) wikipages

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** For multiple Pages use: PageA|PageB|PageC
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## update

Updates existing new wiki pages. Does not create new ones

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `content` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `summary` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## delete

Deletes a new wiki page

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `reason` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## edit

Edits a new wiki pages. Creates a new page if it does not exist yet

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `content` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `summary` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## upload

Uploads a file

**Parameters**

-   `title` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `pathToFile` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `comment` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customParams` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## uploadOverwrite

Uploads a file and overwrites existing ones

**Parameters**

-   `title` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `pathToFile` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `comment` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customParams` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## batch

Batch Operation

**Parameters**

-   `jobs` **([object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))** 
-   `summary` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `concurrency` **\[[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

## sparqlQuery

Executes a SPARQL Query
Defaults to use the wikidata endpoint

**Parameters**

-   `query` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `endpointUrl` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## askQuery

Execute an ASK Query

**Parameters**

-   `query` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `apiUrl` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 
-   `customRequestOptions` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 

Returns **bluebird** 

## merge

Recursively merges two objects

**Parameters**

-   `parent` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Parent Object
-   `child` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Child Object; overwrites parent properties

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Merged Object

## logStatus

Prints status information about a completed request

**Parameters**

-   `status`  
-   `currentCounter`  
-   `totalCounter`  
-   `operation`  
-   `pageName`  
-   `reason`  
