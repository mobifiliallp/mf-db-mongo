const dbMongo = require('../index');

function configureDal() {
  console.log('configureDal: ...');
  const url = 'mongodb://localhost/test';
  const options = {
  };

  return dbMongo.initialize(url, options)
    .then(() => {
      console.log('configureDal: database connected');
    }).catch((e) => {
      console.error('configureDal', e);
    });
}

function testQuery() {
  console.log('testQuery: ...');
  return new Promise((resolve, reject) => {
    dbMongo.getCollection('testcollection')
      .then(testcollection => testcollection.findOne({}))
      .then((result) => {
        console.log('testQuery: success');
        resolve(result);
      })
      .catch((error) => {
        console.error('testQuery %s', error.message);
        reject(error);
      });
  });
}

function testCheck() {
  console.log('testCheck: ...');
  // console.log('testCheck: connected', dbMongo.getMongoClient().isConnected());

  testQuery()
    .catch((e) => {
      // console.error('testCheck', e);
    })
    .then(() => {
      console.log('\n\nscheduling next check ...\n');
      setTimeout(testCheck, 5000);
    });
}

function startup() {
  configureDal()
    .catch((e) => {
      console.error('startup: configureDal:', e);
    })
    .then(() => testCheck());
}

startup();
