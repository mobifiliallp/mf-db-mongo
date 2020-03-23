/**
 * Mobifilia Common - Mongo DB wrapper.
 *
 * Simple wrapper over official nodejs Mongodb driver.
 * Logs basic db events.
 *
 * Configuration -
 *   "mongodb": {
 *     "url": "mongodb://localhost:27017",
 *     "options": {
 *       "auth": {
 *         "user": "",
 *         "password": ""
 *       }
 *     }
 *   }
 * Call the initialize method somewhere in your startup code.
 * e.g. initialize(mongodb.url, mongodb.options)
 */
const config = require('config')
const lodash = require('lodash')
const mongodb = require('mongodb')
const MfLogger = require('mf-logger')

const logger = MfLogger.getContextLogger('mf-db', 'mongo')

const MongoClient = mongodb.MongoClient

const locals = {
  initializer: undefined,
  mongoClient: undefined,
  db: undefined
}

let mongoConfig = {
  url: 'mongodb://localhost:27017',
  options: {
  }
}

const defaultMongoConnectOptions = {
  useNewUrlParser: true,
  bufferMaxEntries: 0
  // reconnectInterval: 10000,
  // reconnectTries: 5,
}

if (config.has('mongodb')) {
  const appMongoConfig = config.get('mongodb')
  mongoConfig = lodash.mergeWith(mongoConfig, appMongoConfig)
}

function attachEventHanders (db) {
  logger.traceF('attachEventHanders')
  db.on('close', () => {
    // delete locals.db;
    logger.info('close')
  })
  db.on('error', (error) => {
    logger.error(error)
  })
  db.on('fullsetup', () => {
    logger.info('fullsetup')
  })
  db.on('parseError', (error) => {
    logger.error(error)
  })
  db.on('reconnect', () => {
    logger.info('Reconnected')
  })
  db.on('timeout', (error) => {
    logger.error(error)
  })
  if (db.s) {
    db.s.topology.on('reconnectFailed', (error) => {
      logger.error('reconnectFailed', error)
    })
  }
}

/**
 * Connects to the database with the given parameters.
 *
 * @param {String} [url] The db connection URI string.
 * @param {Object} [options] Optional settings.
 */
function initialize (url, options) {
  logger.traceF('initialize')
  let connectUrl = url
  if (connectUrl === undefined) {
    connectUrl = mongoConfig.url
  }
  let connectOptions
  if (options === undefined) {
    connectOptions = lodash.mergeWith(defaultMongoConnectOptions, mongoConfig.options)
  } else {
    connectOptions = lodash.mergeWith(defaultMongoConnectOptions, options)
  }

  // check if we have already been initialized
  if (locals.initializer !== undefined) {
    return locals.initializer
  }

  locals.connecting = true
  locals.initializer = new Promise((resolve, reject) => {
    MongoClient.connect(connectUrl, connectOptions)
      .then((mongoClient) => {
        locals.mongoClient = mongoClient
        locals.db = mongoClient.db()
        attachEventHanders(locals.db)
        resolve(locals.db)
        locals.connecting = false
        logger.debug('topology', locals.db.topology)
      }).catch((e) => {
        logger.error(e)
        locals.connecting = false
        reject(e)
      })
  })

  return locals.initializer
}
module.exports.initialize = initialize

function shutdown (force = false) {
  const client = getMongoClient()
  if (client) {
    client.close(force)
  }
}
module.exports.shutdown = shutdown

/**
 * Gets the underlying MongoClient instance.
 */
function getMongoClient () {
  return locals.mongoClient
}
module.exports.getMongoClient = getMongoClient

/**
 * Gets the underlying 'Db' instance.
 */
function getDb () {
  return locals.db
}
module.exports.getDb = getDb

// function tryReconnecting () {
//   if (locals.mongoClient === undefined) {
//     logger.error('MeteorClient not initialized!')
//     return;
//   }

//   if (locals.connecting) {
//     return
//   }

//   logger.traceF('tryReconnecting')
//   locals.mongoClient.connect((error, mongoClient) => {
//     if (error) {
//       logger.error(error)
//     } else {
//       locals.db = mongoClient.db()
//       attachEventHanders(locals.db)
//     }

//     locals.connecting = false
//   })
// }

/**
 * Gets a mongo collection by name.
 *
 * @param {String} collectionName The collection name.
 */
function getCollection (collectionName) {
  // logger.traceF('getCollection', { collectionName });
  logger.traceF('getCollection', { connected: locals.mongoClient.isConnected() })
  return new Promise((resolve, reject) => {
    if (locals.db !== undefined) {
      resolve(locals.db.collection(collectionName))
    } else {
      reject(new Error('Not connected!'))
      // tryReconnecting();
    }
  })
}
module.exports.getCollection = getCollection

/**
 * Makes a mongo ObjectID from the given parameter.
 * @param {string|mongodb.ObjectID} stringOrObjectId A string ID or a mongo ObjectID.
 * @returns {mongodb.ObjectID}
 */
function getObjectId (stringOrObjectId) {
  if (lodash.isString(stringOrObjectId)) {
    return new mongodb.ObjectID(stringOrObjectId)
  } else if (mongodb.ObjectID.isValid(stringOrObjectId)) {
    return stringOrObjectId
  } else {
    throw new Error('E_INVALID_PARAMETER_FOR_OBJECTID')
  }
}
module.exports.getObjectId = getObjectId

function getIdString (stringOrObjectId) {
  if (mongodb.ObjectID.isValid(stringOrObjectId)) {
    if (lodash.isString(stringOrObjectId)) {
      return stringOrObjectId
    } else {
      try {
        return stringOrObjectId.toHexString()
      } catch (e) {
        logger.error(e)
        throw new Error('E_INVALID_OBJECTID')
      }
    }
  }
}
module.exports.getIdString = getIdString

/**
 * The underlying mongodb driver.
 */
module.exports.mongodb = mongodb

/**
 * @deprecated - use getObjectId and getIdString instead
 */
module.exports.ObjectID = mongodb.ObjectID
