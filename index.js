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
const MongoClient = require('mongodb').MongoClient;
const logWrapper = require('mf-logwrapper');

const logger = logWrapper.getContextLogger('mf-db', 'mongo');

const _locals = {
  mongoClient: undefined,
  db: undefined,
};

function attachEventHanders(db) {
  db.on('error', (error) => {
    logger.error(error);
  });
  db.on('parseError', (error) => {
    logger.error(error);
  });
  db.on('reconnect', () => {
    logger.info('Reconnected');
  });
}

/**
 * Connects to the database with the given parameters.
 *
 * @param {String} url The db connection URI string.
 * @param {Object} options Optional settings.
 */
function initialize(url, options) {
  logger.traceF('initialize');
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, options)
      .then((mongoClient) => {
        _locals.mongoClient = mongoClient;
        _locals.db = mongoClient.db();
        attachEventHanders(_locals.db);
        resolve(_locals.db);
      }).catch((e) => {
        logger.error(e);
        reject(e);
      });
  });
}
module.exports.initialize = initialize;

/**
 * Gets the underlying MongoClient instance.
 */
function getMongoClient() {
  return _locals.mongoClient;
}
module.exports.getMongoClient = getMongoClient;

/**
 * Gets the underlying 'Db' instance.
 */
function getDb() {
  return _locals.db;
}
module.exports.getDb = getDb;

/**
 * Gets a mongo collection by name.
 *
 * @param {String} collectionName The collection name.
 */
function getCollection(collectionName) {
  return new Promise((resolve, reject) => {
    if (_locals.db !== undefined) {
      resolve(_locals.db.collection(collectionName));
    } else {
      reject(new Error('Not connected!'));
    }
  });
}
module.exports.getCollection = getCollection;
