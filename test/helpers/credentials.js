'use strict';

/**
 * Login credentials for the test wiki.
 * test/mocking/loginCredentials.local.json takes precedence if it exists.
 */
let loginCredentials = require('../mocking/loginCredentials.json');

try {
    const loginCredentialsLocal = require('../mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch {
    // no local credentials, use the defaults
}

module.exports = loginCredentials;
