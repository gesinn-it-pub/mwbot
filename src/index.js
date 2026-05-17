'use strict';

const fs = require('fs');
const path = require('path');
const pMap = require('p-map');
const { CookieJar } = require('tough-cookie');
const semlog = require('semlog');
const semver = require('semver');
const log = semlog.log;
const packageJson = require('../package.json');

/**
 * Maps over an iterable sequentially, awaiting each item before starting the next.
 *
 * @param {Iterable} iterable
 * @param {Function} mapper
 * @returns {Promise<Array>}
 */
async function pMapSeries(iterable, mapper) {
    const results = [];
    for (const item of iterable) {
        results.push(await mapper(item));
    }
    return results;
}

/**
 * MWBot, a Node.js module for interacting with the MediaWiki API.
 *
 * @author Simon Heimler, Alexander Gesinn (gesinn.it GmbH & Co. KG)
 *
 * @param {{}} [customOptions]        Custom options
 * @param {{}} [customRequestOptions] Custom request options
 */
class MWBot {
    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    /**
     * Constructs a new MWBot instance
     * It is advised to create one bot instance for every API to use
     * A bot instance has its own state (e.g. tokens) that is necessary for some operations
     */
    constructor(customOptions, customRequestOptions) {
        /**
         * Bot instance Login State
         * Is received from the MW Login API and contains token, userid, etc.
         *
         * @type {object}
         */
        this.state = {};

        /**
         * Bot instance is logged in or not
         *
         * @type {boolean}
         */
        this.loggedIn = false;

        /**
         * Bot instances edit token
         *
         * @type {boolean}
         */
        this.editToken = false;

        /**
         * MediaWiki Version (semver)
         *
         * @type {object} a semver object
         */
        this.mwversion = {};

        /**
         * Bot instances createaccount token
         *
         * @type {boolean}
         */
        this.createaccountToken = false;

        /**
         * Internal statistics
         *
         * @type {object}
         */
        this.counter = {
            total: 0,
            resolved: 0,
            fulfilled: 0,
            rejected: 0,
        };

        /**
         * Default options.
         * Should be immutable
         *
         * @type {object}
         */
        this.defaultOptions = {
            verbose: false,
            silent: false,
            defaultSummary: 'MWBot',
            concurrency: 1,
            apiUrl: false,
            sparqlEndpoint: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql', // Wikidata
        };

        /**
         * Custom options as the user provided them originally.
         *
         * @type {object}
         */
        this.customOptions = customOptions || {};

        /**
         * Actual, current options of the bot instance
         * They're a mix of the default options, the custom options and later changes
         *
         * @type {Object}
         */
        this.options = MWBot.merge(this.defaultOptions, this.customOptions);

        /**
         * Default options for HTTP requests
         *
         * @type {Object}
         */
        this.defaultRequestOptions = {
            method: 'POST',
            headers: {
                'User-Agent': 'mwbot/' + packageJson.version,
            },
            qs: {
                format: 'json',
            },
            form: {},
            timeout: 120000, // 120 seconds
        };

        /**
         * Cookie jar for session cookie persistence across requests
         *
         * @type {CookieJar}
         */
        this.cookieJar = new CookieJar();

        /**
         * Custom request options
         *
         * @type {{}}
         */
        this.customRequestOptions = customRequestOptions || {};

        /**
         * The actual, current options for the NPM request library
         *
         * @type {Object}
         */
        this.globalRequestOptions = MWBot.merge(this.defaultRequestOptions, this.customRequestOptions);

        // SEMLOG OPTIONS
        semlog.updateConfig(this.options.semlog || {});
    }

    //////////////////////////////////////////
    // GETTER & SETTER                      //
    //////////////////////////////////////////

    /**
     * Get mwbot version number
     * Uses ES5 getter
     */
    get version() {
        return packageJson.version;
    }

    /**
     * Set and overwrite mwbot options
     *
     * @param {Object} customOptions
     */
    setOptions(customOptions) {
        this.options = MWBot.merge(this.options, customOptions);
        this.customOptions = MWBot.merge(this.customOptions, customOptions);
    }

    /**
     * Sets and overwrites the raw request options, used by the "request" library
     * See https://www.npmjs.com/package/request
     *
     * @param {{}} customRequestOptions
     */
    setGlobalRequestOptions(customRequestOptions) {
        this.globalRequestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
        this.customRequestOptions = MWBot.merge(this.customRequestOptions, customRequestOptions);
    }

    /**
     * Sets the API URL for MediaWiki requests
     * This can be uses instead of a login, if no actions are used that require one.
     *
     * @param {String}  apiUrl  API Url to MediaWiki, e.g. 'https://www.semantic-mediawiki.org/w/api.php'
     */
    setApiUrl(apiUrl) {
        this.options.apiUrl = apiUrl;
    }

    //////////////////////////////////////////
    // CORE REQUESTS                        //
    //////////////////////////////////////////

    /**
     * Executes a promisified raw request using the Node.js built-in fetch API.
     * Cookies are persisted automatically via the instance's CookieJar.
     *
     * @param {object} requestOptions
     *
     * @returns {Promise}
     */
    rawRequest(requestOptions) {
        this.counter.total += 1;
        this.counter.resolved += 1;

        if (!requestOptions.uri) {
            this.counter.rejected += 1;
            return Promise.reject(new Error('No URI provided!'));
        }

        // Build URL, appending query-string parameters when present
        let url = requestOptions.uri;
        if (requestOptions.qs && Object.keys(requestOptions.qs).length > 0) {
            url += '?' + new URLSearchParams(requestOptions.qs).toString();
        }

        const headers = {
            ...(this.globalRequestOptions?.headers ?? {}),
            ...(requestOptions.headers ?? {}),
        };

        // Attach cookies from the jar for this URL
        const cookieString = this.cookieJar.getCookieStringSync(url);
        if (cookieString) {
            headers['Cookie'] = cookieString;
        }

        // Build request body: FormData for multipart uploads, URLSearchParams for regular POSTs
        let body;
        if (requestOptions.formData instanceof FormData) {
            body = requestOptions.formData;
            // fetch sets Content-Type with the multipart boundary automatically
        } else if (requestOptions.form && Object.keys(requestOptions.form).length > 0) {
            body = new URLSearchParams(requestOptions.form);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout ?? 120000);

        return fetch(url, {
            method: requestOptions.method ?? 'POST',
            headers,
            body,
            signal: controller.signal,
        })
            .then((response) => {
                // Persist Set-Cookie headers from the response
                for (const cookie of response.headers.getSetCookie()) {
                    this.cookieJar.setCookieSync(cookie, url);
                }
                return response.text();
            })
            .then((text) => {
                this.counter.fulfilled += 1;
                try {
                    return JSON.parse(text);
                } catch {
                    return text;
                }
            })
            .catch((err) => {
                this.counter.rejected += 1;
                throw err;
            })
            .finally(() => {
                clearTimeout(timeoutId);
            });
    }

    /**
     *Executes a request with the ability to use custom parameters and custom request options
     *
     * @param {object} params               Request Parameters
     * @param {object} customRequestOptions Custom request options
     *
     * @returns {Promise}
     */
    request(params, customRequestOptions) {
        return new Promise((resolve, reject) => {
            this.globalRequestOptions.uri = this.options.apiUrl;

            const requestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
            requestOptions.form = MWBot.merge(requestOptions.form, params);

            this.rawRequest(requestOptions)
                .then((response) => {
                    if (typeof response !== 'object') {
                        const err = new Error('invalidjson: No valid JSON response');
                        err.code = 'invalidjson';
                        err.info = 'No valid JSON response';
                        err.response = response;
                        return reject(err);
                    }

                    if (response.error) {
                        // See https://www.mediawiki.org/wiki/API:Errors_and_warnings#Errors
                        const err = new Error(response.error.code + ': ' + response.error.info);
                        // Enhance error object with additional information
                        err.errorResponse = true;
                        err.code = response.error.code;
                        err.info = response.error.info;
                        err.response = response;
                        err.request = requestOptions;
                        return reject(err);
                    }

                    return resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

    /**
     * Executes a Login
     *
     * @see https://www.mediawiki.org/wiki/API:Login
     *
     * @param {object} [loginOptions]
     *
     * @returns {Promise}
     */
    login(loginOptions) {
        this.loginPromise = new Promise((resolve, reject) => {
            this.options = MWBot.merge(this.options, loginOptions);

            if (!this.options.username || !this.options.password || !this.options.apiUrl) {
                return reject(new Error('Incomplete login credentials!'));
            }

            const loginString = this.options.username + '@' + this.options.apiUrl.split('/api.php').join('');

            // Step 1: fetch login token via tokens API (MW 1.27+)
            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'login',
            })
                .then((response) => {
                    if (!response.query?.tokens?.logintoken) {
                        const err = new Error('Invalid response from API');
                        err.response = response;
                        if (!this.options.silent) log('[E] [MWBOT] Login failed with invalid response: ' + loginString);
                        return reject(err);
                    }
                    // Step 2: login with token
                    return this.request({
                        action: 'login',
                        lgname: this.options.username,
                        lgpassword: this.options.password,
                        lgtoken: response.query.tokens.logintoken,
                    });
                })
                .then((response) => {
                    if (response.login && response.login.result === 'Success') {
                        this.state = MWBot.merge(this.state, response.login);
                        this.loggedIn = true;
                    } else {
                        let reason = 'Unknown reason';
                        if (response.login && response.login.result) {
                            reason = response.login.result;
                        }
                        const err = new Error('Could not login: ' + reason);
                        err.response = response;
                        if (!this.options.silent) log('[E] [MWBOT] Login failed: ' + loginString);
                        return reject(err);
                    }
                })
                .then(() => {
                    this._ensureMwVersion()
                        .then(() => resolve(this.state))
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    reject(err);
                });
        });

        return this.loginPromise;
    }

    /**
     * Ensures this.mwversion is populated, fetching siteinfo if needed.
     * This allows read operations to work without a prior login() call.
     *
     * @returns {Promise}
     */
    _ensureMwVersion() {
        if (semver.valid(this.mwversion)) {
            return Promise.resolve();
        }
        return this.getSiteinfo().then(() => {
            this.mwversion = semver.coerce(this.state.generator);
            if (!semver.valid(this.mwversion)) {
                throw new Error('Invalid MediaWiki version: ' + JSON.stringify(this.mwversion));
            }
        });
    }

    /**
     * Gets overall site information.
     *
     * @returns {Promise}
     */
    getSiteinfo() {
        return new Promise((resolve, reject) => {
            this.request({
                action: 'query',
                meta: 'siteinfo',
                siprop: 'general',
            })
                .then((response) => {
                    if (response.query && response.query.general) {
                        this.state = MWBot.merge(this.state, response.query.general);
                        return resolve(this.state);
                    } else {
                        const err = new Error('[E] [MWBOT] Could not get siteinfo');
                        err.response = response;
                        return reject(err);
                    }
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    /**
     * Gets an edit token
     *
     * @returns {Promise}
     */
    getEditToken() {
        return new Promise((resolve, reject) => {
            if (this.editToken) {
                return resolve(this.state);
            }

            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'csrf',
            })
                .then((response) => {
                    if (response.query && response.query.tokens && response.query.tokens.csrftoken) {
                        this.editToken = response.query.tokens.csrftoken;
                        this.state = MWBot.merge(this.state, response.query.tokens);
                        return resolve(this.state);
                    } else {
                        const err = new Error('Could not get edit token');
                        err.response = response;
                        return reject(err);
                    }
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    /**
     * Gets a createaccount token
     *
     * @returns {Promise}
     */
    getCreateaccountToken() {
        return new Promise((resolve, reject) => {
            if (this.createaccountToken) {
                return resolve(this.state);
            }

            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'createaccount',
            })
                .then((response) => {
                    if (response.query && response.query.tokens && response.query.tokens.createaccounttoken) {
                        this.createaccountToken = response.query.tokens.createaccounttoken;
                        this.state = MWBot.merge(this.state, response.query.tokens);
                        return resolve(this.state);
                    } else {
                        const err = new Error('Could not get createaccount token');
                        err.response = response;
                        return reject(err);
                    }
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    /**
     * Combines Login  with GetEditToken
     *
     * @param loginOptions
     *
     * @returns {Promise}
     */
    loginGetEditToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getEditToken();
        });
    }

    /**
     * Combines Login  with GetCreateaccountToken
     *
     * @param loginOptions
     *
     * @returns {Promise}
     */
    loginGetCreateaccountToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getCreateaccountToken();
        });
    }

    /**
     * Logs out and resets the bot instance state.
     *
     * @see https://www.mediawiki.org/wiki/API:Logout
     *
     * @returns {Promise}
     */
    logout() {
        const doLogout = (token) =>
            this.request({ action: 'logout', token }).then(() => {
                this.loggedIn = false;
                this.editToken = false;
                this.createaccountToken = false;
                this.state = {};
                this.mwversion = {};
                this.cookieJar = new CookieJar();
            });

        if (this.editToken) {
            return doLogout(this.editToken);
        }
        return this.getEditToken().then(() => doLogout(this.editToken));
    }

    //////////////////////////////////////////
    // CRUD OPERATIONS                      //
    //////////////////////////////////////////

    /**
     * Creates a new wiki pages. Does not edit existing ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    create(title, content, summary, customRequestOptions) {
        return this.request(
            {
                action: 'edit',
                title: title,
                text: content,
                summary: summary || this.options.defaultSummary,
                createonly: true,
                token: this.editToken,
            },
            customRequestOptions
        );
    }

    createProtect(title, content, summary, customRequestOptions) {
        return this.create(title, content, summary, customRequestOptions).then(() => {
            return this.protect(title, null, '', customRequestOptions);
        });
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     * Wrapper for readWithProps
     *
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    read(title, redirect, customRequestOptions) {
        return this.readWithProps(title, 'content', redirect, customRequestOptions);
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     * Wrapper for readWithPropsFromID
     *
     * @param {number}  pageid    For multiple Pages use: PageA|PageB|PageC
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    readFromID(pageid, redirect, customRequestOptions) {
        return this.readWithPropsFromID(pageid, 'content', redirect, customRequestOptions);
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages based on specific parameters
     *
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {string}  props    For multiple Props use: user|userid|content
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    readWithProps(title, props, redirect, customRequestOptions) {
        const params = {
            action: 'query',
            prop: 'revisions',
            rvprop: props,
            rvslots: 'main',
            titles: title,
        };

        if (!redirect) {
            params.redirects = 'true';
        }

        return this.request(params, customRequestOptions);
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages based on specific parameters
     *
     * @param {number}  pageid    For multiple Pages use: PageA|PageB|PageC
     * @param {string}  props    For multiple Props use: user|userid|content
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    readWithPropsFromID(pageid, props, redirect, customRequestOptions) {
        const params = {
            action: 'query',
            prop: 'revisions',
            rvprop: props,
            rvslots: 'main',
            pageids: pageid,
        };

        if (!redirect) {
            params.redirects = 'true';
        }

        return this.request(params, customRequestOptions);
    }

    /**
     * Edits a new wiki pages. Creates a new page if it does not exist yet.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    edit(title, content, summary, customRequestOptions) {
        return this.request(
            {
                action: 'edit',
                title: title,
                text: content,
                summary: summary || this.options.defaultSummary,
                token: this.editToken,
                bot: true,
            },
            customRequestOptions
        );
    }

    editProtect(title, content, summary, customRequestOptions) {
        return this.edit(title, content, summary, customRequestOptions).then(() => {
            return this.protect(title, null, '', customRequestOptions);
        });
    }

    /**
     * Updates existing wiki pages. Does not create new ones.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    update(title, content, summary, customRequestOptions) {
        return this.request(
            {
                action: 'edit',
                title: title,
                text: content,
                summary: summary || this.options.defaultSummary,
                nocreate: true,
                bot: true,
                token: this.editToken,
            },
            customRequestOptions
        );
    }

    /**
     * Updates existing wiki pages. Does not create new ones.
     *
     * @param {number}  pageid
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    updateFromID(pageid, content, summary, customRequestOptions) {
        return this.request(
            {
                action: 'edit',
                pageid: pageid,
                text: content,
                summary: summary || this.options.defaultSummary,
                nocreate: true,
                bot: true,
                token: this.editToken,
            },
            customRequestOptions
        );
    }

    /**
     * Deletes a new wiki page
     *
     * @param {string}  title
     * @param {string}  [reason]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    delete(title, reason, customRequestOptions) {
        return this.request(
            {
                action: 'delete',
                title: title,
                reason: reason || this.options.defaultSummary,
                token: this.editToken,
            },
            customRequestOptions
        );
    }

    /**
     * Protect a wiki page
     *
     * @param {string}  title
     * @param {string}  [protections]
     * @param {string}  [reason]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    protect(title, protections, reason, customRequestOptions) {
        return this.request(
            {
                action: 'protect',
                title: title,
                protections: protections || this.options.protections || 'edit=sysop',
                expiry: 'infinite',
                reason: reason || this.options.defaultSummary,
                token: this.editToken,
            },
            customRequestOptions
        );
    }

    /**
     * Moves a wiki page
     *
     * @param {string}  oldName
     * @param {string}  newName
     * @param {string}  [reason]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    move(oldTitle, newTitle, reason, customRequestOptions) {
        return this.request(
            {
                action: 'move',
                from: oldTitle,
                to: newTitle,
                reason: reason || this.options.defaultSummary,
                token: this.editToken,
                bot: true,
            },
            customRequestOptions
        );
    }

    /**
     * Uploads a file
     *
     * @param {string}  [title]
     * @param {string}  pathToFile
     * @param {string}  [comment]
     * @param {object}  [customParams]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    upload(title, pathToFile, comment, customParams, customRequestOptions) {
        try {
            // Read file synchronously and wrap in a Blob for multipart upload
            const fileBuffer = fs.readFileSync(pathToFile);
            const formData = new FormData();

            const params = MWBot.merge(
                {
                    action: 'upload',
                    filename: title || path.basename(pathToFile),
                    comment: comment || '',
                    token: this.editToken,
                    ignorewarnings: 1,
                },
                customParams
            );

            for (const [key, value] of Object.entries(params)) {
                formData.append(key, String(value));
            }

            formData.append('file', new Blob([fileBuffer]), path.basename(pathToFile));

            const requestOptions = MWBot.merge(
                {
                    uri: this.options.apiUrl,
                    method: 'POST',
                    headers: this.globalRequestOptions.headers,
                    qs: this.globalRequestOptions.qs,
                    timeout: this.globalRequestOptions.timeout,
                    formData,
                },
                customRequestOptions
            );

            return this.rawRequest(requestOptions).then((response) => {
                if (response && typeof response === 'object' && response.error) {
                    const err = new Error(response.error.code + ': ' + response.error.info);
                    err.code = response.error.code;
                    err.info = response.error.info;
                    err.response = response;
                    throw err;
                }
                return response;
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Uploads a file and overwrites existing ones
     *
     * @param {string}  [title]
     * @param {string}  pathToFile
     * @param {string}  [comment]
     * @param {object}  [customParams]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions) {
        const params = MWBot.merge(
            {
                ignorewarnings: 1,
            },
            customParams
        );
        return this.upload(title, pathToFile, comment, params, customRequestOptions);
    }

    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    /**
     * Combines all standard CRUD operations into one concurrent batch operation
     * The batch request will also print log messages about the current job status
     * It includes some more detailed error handling
     *
     * If the concurrency is set to 1, it ensures a sequential order
     * by switching from Promise.map to Promise.mapSeries
     *
     * @param {object|array}   jobs
     * @param {string}  [summary]
     * @param {number}  [concurrency]
     * @param {object}  [customRequestOptions]
     */
    batch(jobs, summary, concurrency, customRequestOptions) {
        return new Promise((resolve, reject) => {
            summary = summary || this.options.defaultSummary;
            concurrency = concurrency || this.options.concurrency;

            let jobQueue = [];
            const results = {};

            // Jobs can be written in object or array notation
            // If it is written in the more convenient object notation, convert it to array notation
            if (Array.isArray(jobs)) {
                jobQueue = jobs;
            } else {
                for (const operation in jobs) {
                    const operationJobs = jobs[operation];
                    if (Array.isArray(operationJobs)) {
                        if (operation === 'upload' || operation === 'uploadOverwrite') {
                            for (const filePath of operationJobs) {
                                jobQueue.push([
                                    operation,
                                    path.basename(filePath),
                                    filePath,
                                    summary,
                                    false,
                                    customRequestOptions,
                                ]);
                            }
                        } else {
                            for (const pageName of operationJobs) {
                                jobQueue.push([operation, pageName, summary, customRequestOptions]);
                            }
                        }
                    } else {
                        if (operation === 'upload' || operation === 'uploadOverwrite') {
                            for (const fileName in operationJobs) {
                                const filePath = operationJobs[fileName];
                                jobQueue.push([operation, fileName, filePath, summary, false, customRequestOptions]);
                            }
                        } else {
                            for (const pageName in operationJobs) {
                                const content = operationJobs[pageName];
                                jobQueue.push([operation, pageName, content, summary, customRequestOptions]);
                            }
                        }
                    }
                }
            }

            let currentCounter = 0;
            const totalCounter = jobQueue.length;

            // Use pMapSeries for strictly sequential execution (concurrency=1),
            // pMap for concurrent execution with the given concurrency limit
            const useMapSeries = !concurrency || concurrency === 1;

            const jobHandler = (job) => {
                const operation = job[0];
                const pageName = job[1];

                if (!this[operation]) {
                    return reject(new Error('Unsupported operation: ' + operation));
                }

                // Dynamically invoke the mwbot CRUD function with the parameters from the job array
                return this[operation](pageName, job[2], job[3], job[4])
                    .then((response) => {
                        currentCounter += 1;

                        let status = '[=] ';
                        let reason = '';
                        const debugMessages = [];

                        if (operation === 'delete') {
                            status = '[-] ';
                        } else if (response.edit && response.edit.new === '') {
                            status = '[+] ';
                        } else if (response.edit && response.edit.newrevid) {
                            status = '[C] ';
                        } else if (response.query && response.query.pages && response.query.pages['-1']) {
                            status = '[?] ';
                            reason = 'missing';
                        } else if (response.query && response.query.pages) {
                            status = '[S] ';
                        } else if (response.upload && response.upload.result === 'Success') {
                            status = '[S] ';
                        } else if (response.upload && response.upload.result === 'Warning') {
                            status = '[/] ';
                            if (response.upload.warnings && response.upload.warnings.duplicate) {
                                reason = 'duplicate';
                                debugMessages.push(
                                    '[D] [MWBOT] Duplicate: ' + response.upload.warnings.duplicate.join(', ')
                                );
                            }
                            if (response.upload.warnings && response.upload.warnings.exists) {
                                reason = 'exists';
                                debugMessages.push('[D] [MWBOT] Exists: ' + response.upload.warnings.exists);
                            }
                        }

                        MWBot.logStatus(status, currentCounter, totalCounter, operation, pageName, reason);

                        for (const msg of debugMessages) {
                            if (!this.options.silent) log(msg);
                        }

                        if (!results[operation]) {
                            results[operation] = {};
                        }
                        results[operation][pageName] = response;
                    })
                    .catch((err) => {
                        currentCounter += 1;

                        let status = '[E] ';
                        let reason = '';

                        if (err.response && err.response.error && err.response.error.code) {
                            const code = err.response.error.code;
                            if (code === 'articleexists' || code === 'fileexists-no-change') {
                                status = '[/] ';
                                reason = code;
                            } else if (code === 'missingtitle') {
                                status = '[?] ';
                                reason = code;
                            } else if (code === 'badtoken') {
                                // in case of fatal errors, cancel further jobQueue processing
                                console.log(this.editToken);
                                throw err;
                            }
                        }

                        MWBot.logStatus(status, currentCounter, totalCounter, operation, pageName, reason);

                        if (status === '[E] ' && !this.options.silent) {
                            log(err);
                            if (err.response) {
                                log(err.response);
                            }
                        } else if (
                            this.options.verbose &&
                            err.response &&
                            err.response.error &&
                            err.response.error.info
                        ) {
                            log('[D] ' + err.response.error.info);
                        }

                        if (!results[operation]) {
                            results[operation] = {};
                        }

                        results[operation][pageName] = err;
                    });
            };

            (useMapSeries
                ? pMapSeries(jobQueue, jobHandler)
                : pMap(jobQueue, jobHandler, { concurrency })
            )
                .then(() => {
                    return resolve(results);
                })
                .catch((err) => {
                    // If an error happens, return the results nonetheless, as it contains all the errors
                    // embedded in its data structure
                    if (!this.options.silent) {
                        log('[E] [MWBOT] At least one exception occured during the batch job:');
                        log(err);
                    }
                    return reject(results);
                });
        });
    }

    /**
     * Execute an ASK Query
     *
     * @param {string} query
     * @param {string} [apiUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {Promise}
     */
    askQuery(query, apiUrl, customRequestOptions) {
        apiUrl = apiUrl || this.options.apiUrl;

        const requestOptions = MWBot.merge(
            {
                method: 'GET',
                uri: apiUrl,
                json: true,
                qs: {
                    action: 'ask',
                    format: 'json',
                    query: query,
                },
            },
            customRequestOptions
        );

        return this.rawRequest(requestOptions);
    }

    /**
     * Executes a SPARQL Query
     * Defaults to use the wikidata endpoint
     *
     * @param {string} query
     * @param {string} [endpointUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {Promise}
     */
    sparqlQuery(query, endpointUrl, customRequestOptions) {
        endpointUrl = endpointUrl || this.options.sparqlEndpoint;

        const requestOptions = MWBot.merge(
            {
                method: 'GET',
                uri: endpointUrl,
                json: true,
                qs: {
                    format: 'json',
                    query: query,
                },
            },
            customRequestOptions
        );

        return this.rawRequest(requestOptions);
    }

    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
    //////////////////////////////////////////

    /**
     * Recursively merges two objects
     * Takes care that the two objects are not mutated
     *
     * @param {object} parent   Parent Object
     * @param {object} child    Child Object; overwrites parent properties
     *
     * @returns {object}        Merged Object
     */
    static merge(parent, child) {
        parent = parent || {};
        child = child || {};
        // Use {} as first parameter, as this object is mutated by default
        // We don't want that, so we're providing an empty object that is thrown away after the operation
        return Object.assign({}, parent, child);
    }

    /**
     * Prints status information about a completed request
     *
     * @param status
     * @param currentCounter
     * @param totalCounter
     * @param operation
     * @param pageName
     * @param reason
     */
    static logStatus(status, currentCounter, totalCounter, operation, pageName, reason) {
        operation = operation || '';

        if (operation === 'createProtect') {
            operation = 'createprot';
        }

        if (operation === 'editProtect') {
            operation = 'editprot';
        }

        if (operation === 'uploadOverwrite') {
            operation = 'upload!';
        }

        if (operation) {
            operation = ' [' + operation.toUpperCase() + ']';
            operation = (operation + '            ').substring(0, 12); // Right space padding: http://stackoverflow.com/a/24398129
        }

        reason = reason || '';
        if (reason) {
            reason = ' (' + reason + ')';
        }

        log(
            status +
                '[' +
                semlog.pad(currentCounter, 4) +
                '/' +
                semlog.pad(totalCounter, 4) +
                ']' +
                operation +
                pageName +
                reason
        );
    }
}

/**
 * Expose the native Promise constructor
 */
MWBot.Promise = Promise;

/**
 * Expose p-map for concurrent batch requests
 * @link https://github.com/sindresorhus/p-map
 */
MWBot.map = pMap;

/**
 * Expose pMapSeries for sequential batch requests
 */
MWBot.mapSeries = pMapSeries;

module.exports = MWBot;
