# Mobifilia Common - Mongo DB Wrapper
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Simple wrapper over official nodejs Mongodb driver.
Also logs basic db events.

## Configuration
  The module reads the configuration of the app if available. Sample configuration
  ```JSON
    "mongodb": {
      "url": "mongodb://localhost:27017",
      "options": {
        "auth": {
          "user": "anonymous",
          "password": "nopassword"
        },
        "useNewUrlParser": true,
     }
   }
  ```

## Usage
Call the `initialize` method before accessing the database client
```js
const mfDbMongo = require('mf-db-mongo');

// This will read the configuration from the config files and initialize.
function connectDbCustom() {
  return mfDbMongo.initialize();
}

// You can also pass in your own url and options
function connectDbCustom() {
  const url = 'mongodb://your/mongodb/url';
  const options = {}; // your mongodb connect options.
  return mfDbMongo.initialize(url, options);
}

// Helper methods to convert between mongo ObjectIDs and string IDs

const objId = mfDbMongo.getObjectId('5da72ca5e2c954652bab270d')
// objId = ObjectID('5da72ca5e2c954652bab270d')

const id = mfDbMongo.getIdString(mfDbMongo.mongodb.ObjectID('5da72ca5e2c954652bab270d'))
// id = '5da72ca5e2c954652bab270d'
```

The underlying mongodb driver is also exposed if needed. You can use this to access 
```js
const mfDbMongo = require('mf-db-mongo');

// this is the underlying node mongodb module, equivalent to - require('mongodb');
const mongodb = mfDbMongo.mongodb; 

// equivalent to - require('mongodb').ObjectID;
// Deprecated - getObjectId and getIdString instead
const ObjectID = mongodb.ObjectID; 
```
You can close / terminate a DB connection by calling the `shutdown` method. This method takes an optional boolean parameter, pass `true` to force a shutdown.
```js
const mfDbMongo = require('mf-db-mongo');

function exitCleanly() {
  return mfDbMongo.shutdown();
}

function exitNow() {
  return mfDbMongo.shutdown(true);
}

```