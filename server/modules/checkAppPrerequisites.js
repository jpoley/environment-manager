'use strict'

let co = require('co');
let config = require('config');
let resourceProvider = require('modules/resourceProvider');
let logger = require('modules/logger');
let guid = require('node-uuid');

let permissionsResource;

function checkAppPrerequisites() {
  return co(function* () {
    logger.info('Checking app prerequisites..');

    let permissionsExist = yield checkIfPermissionsExist();

    if (!permissionsExist) {
      yield insertDefaultAdminPermission();
    }

    logger.info('App prerequisites satisfied.');
  });
}

function checkIfPermissionsExist() {
  return co(function* () {
    let results = yield permissionsResource.all({ limit: 1, formatting: {} });
    return !!(results && results.length);
  });
}

function insertDefaultAdminPermission() {
  return co(function* () {
    logger.info('Inserting default admin permission.');
    let localConfig = config.getUserValue('local');
    let defaultAdmin = localConfig.authentication.defaultAdmin;

    if (!defaultAdmin) {
      throw new Error('The value "authentication.defaultAdmin" was not found in config. This is required to create the first permission.');
    }

    yield permissionsResource.post({
      item: {
        Name: defaultAdmin,
        Permissions: [{ Resource: '**', Access: 'ADMIN' }],
        Audit: {
          TransactionID: guid.v1(),
          User: 'system',
          LastChanged: new Date().toISOString(),
          Version: 0
        }
      }
    });
  });
}

module.exports = () => {
  return co(function* () {
    if (permissionsResource === undefined) {
      let parameters = { accountName: config.getUserValue('masterAccountName') };
      permissionsResource = yield resourceProvider.getInstanceByName('config/permissions', parameters);
    }
    return checkAppPrerequisites();
  });
}
