# MWBot

MWBot library

**Parameters**

-   `customOptions`  

## batch

Batch Operation

**Parameters**

-   `jobs` **object or array** 
-   `summary` **[string]** 
-   `concurrency` **[number]** 
-   `customRequestOptions` **[object]** 

## create

Creates a new wiki pages. Does not edit existing ones

**Parameters**

-   `title` **string** 
-   `content` **string** 
-   `summary` **[string]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## delete

Deletes a new wiki page

**Parameters**

-   `title` **string** 
-   `reason` **[string]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## edit

Edits a new wiki pages. Creates a new page if it does not exist yet

**Parameters**

-   `title` **string** 
-   `content` **string** 
-   `summary` **[string]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## getEditToken

Gets an edit token
This is currently only compatible with MW >= 1.24

Returns **bluebird** 

## login

Executes a Login

**Parameters**

-   `loginOptions` **[object]** 

Returns **bluebird** 

## loginGetEditToken

Combines Login  with GetEditToken

**Parameters**

-   `loginOptions`  

Returns **bluebird** 

## rawRequest

Executes a promisified raw request
Uses the npm request library

**Parameters**

-   `requestOptions` **object** 

Returns **bluebird** 

## read

Reads the content / and meta-data of one (or many) wikipages

**Parameters**

-   `title` **string** For multiple Pages use: PageA|PageB|PageC
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## request

Executes a request with the ability to use custom parameters and custom request options

**Parameters**

-   `params` **object** Request Parameters
-   `customRequestOptions` **object** Custom request options

Returns **bluebird** 

## sparqlQuery

Make a SPARQL Query
Defaults to use the wikidata endpoint

**Parameters**

-   `query` **string** 
-   `endpointUrl` **[string]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## update

Updates existing new wiki pages. Does not create new ones

**Parameters**

-   `title` **string** 
-   `content` **string** 
-   `summary` **[string]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## upload

Edits a new wiki pages. Creates a new page if it does not exist yet

**Parameters**

-   `title` **[string]** 
-   `pathToFile` **string** 
-   `comment` **[string]** 
-   `customParams` **[object]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## uploadOverwrite

Uploads a file and overwrites existing ones

**Parameters**

-   `title` **[string]** 
-   `pathToFile` **string** 
-   `comment` **[string]** 
-   `customParams` **[object]** 
-   `customRequestOptions` **[object]** 

Returns **bluebird** 

## logStatus

Prints status information about a completed request

**Parameters**

-   `status`  
-   `currentCounter`  
-   `totalCounter`  
-   `operation`  
-   `pageName`  
-   `reason`  

## merge

Recursively merges two objects

**Parameters**

-   `parent` **object** Parent Object
-   `child` **object** Child Object; overwrites parent properties

Returns **object** Merged Object
