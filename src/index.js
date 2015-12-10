'use strict';

const Promise = require('bluebird');
const request = require('request');

/**
 * MWBot library
 *
 * @author Simon Heimler
 */
class MWBot {


    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    constructor(customOptions) {

        // STATE
        this.state = {};
        this.loggedIn = false;

        // OPTIONS
        this.defaultOptions = {
            verbose: false
        };
        this.customOptions = customOptions || {};
        this.options = MWBot.merge(this.defaultOptions, this.customOptions);

        // REQUEST OPTIONS
        this.defaultRequestOptions = {
            method: 'POST',
            qs: {
                bot: true,
                format: 'json'
            },
            form: {

            },
            jar: true,
            time: true,
            json: true
        };
        this.customRequestOptions = this.options.request || {};
        this.globalRequestOptions = MWBot.merge(this.defaultRequestOptions, this.customRequestOptions);
    }


    //////////////////////////////////////////
    // GETTER & SETTER                      //]
    //////////////////////////////////////////

    get version() {
        let packageJson = require('../package.json');
        return packageJson.version;
    }

    setOptions(customOptions) {
        this.options = MWBot.merge(this.options, customOptions);
    }

    setGlobalRequestOptions(customRequestOptions) {
        this.globalRequestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
    }


    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

    /**
     * Executes a promisified raw request
     * Uses the npm request library
     *
     * @param {{}} requestOptions
     *
     * @returns {bluebird}
     */
    rawRequest(requestOptions) {
        return new Promise((resolve, reject) => {
            if (!requestOptions.uri) {
                return reject(new Error('No API URL provided!'));
            }
            request(requestOptions, (error, response, body) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(body);
                }
            });
        });
    }


    /**
     *Executes a request with the ability to use custom parameters and custom request options
     *
     * @param {{}} params               Request Parameters
     * @param {{}} customRequestOptions Custom request options
     *
     * @returns {bluebird}
     */
    request(params, customRequestOptions) {
        return new Promise((resolve, reject) => {

            this.globalRequestOptions.uri = this.options.apiUrl;

            let requestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
            requestOptions.form = MWBot.merge(requestOptions.form, params);

            this.rawRequest(requestOptions).then((response) => {
                if (response.error) { // See https://www.mediawiki.org/wiki/API:Errors_and_warnings#Errors
                    let err = new Error(response.error.code + ': ' + response.error.info);
                    err.response = response;
                    err.request = requestOptions;
                    return reject(err) ;
                } else {
                    resolve(response);
                }
            }).catch((err) => {
                reject(err);
            });

        });
    }

    /**
     * Executes a Login
     *
     * @param {{}} [loginOptions]
     *
     * @returns {bluebird}
     */
    login(loginOptions) {

        this.loginPromise = new Promise((resolve, reject) => {

            this.options = MWBot.merge(this.options, loginOptions);

            let loginRequest = {
                action: 'login',
                lgname: this.options.username,
                lgpassword: this.options.password
            };

            this.request(loginRequest).then((response) => {

                if (!response.login || !response.login.result) {
                    let err = new Error('Invalid response from API');
                    err.response = response;
                    return reject(err) ;
                } else {
                    this.state = MWBot.merge(this.state, response.login);
                    // Add token and re-submit login request
                    loginRequest.lgtoken = response.login.token;
                    return this.request(loginRequest);
                }

            }).then((response) => {

                if (response.login && response.login.result === 'Success') {
                    this.state = MWBot.merge(this.state, response.login);
                    this.loggedIn = true;
                    return resolve(this.state);
                } else {
                    let reason = 'Unknown reason';
                    if (response.login && response.login.result) {
                        reason = response.login.result;
                    }
                    let err = new Error('Could not login: ' + reason);
                    err.response = response;
                    return reject(err) ;
                }

            }).catch((err) => {
                reject(err);
            });

        });

        return this.loginPromise;

    }

    /**
     * Gets an edit token
     * This is currently only compatible with MW >= 1.24
     *
     * @returns {bluebird}
     */
    getEditToken() {
        return new Promise((resolve, reject) => {

            // MW >= 1.24
            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'csrf'
            }).then((response) => {
                if (response.query && response.query.tokens && response.query.tokens.csrftoken) {
                    this.editToken = response.query.tokens.csrftoken;
                    this.globalRequestOptions.form.token = this.editToken;
                    this.state = MWBot.merge(this.state, response.query.tokens);
                    return resolve(this.state);
                } else {
                    let err = new Error('Could not get edit token');
                    err.response = response;
                    return reject(err) ;
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }


    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    /**
     * Combines Login  with GetEditToken
     *
     * @param loginOptions
     *
     * @returns {bluebird}
     */
    loginGetEditToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getEditToken();
        });
    }

    /**
     * Creates a new wiki pages. Does not edit existing ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {{}}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    create(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || '',
            createonly: true
        }, customRequestOptions);
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     *
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {{}}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    read(title, customRequestOptions) {
        return this.request({
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            titles: title
        }, customRequestOptions);
    }

    /**
     * Updates existing new wiki pages. Does not create new ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {{}}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    update(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || '',
            nocreate: true
        }, customRequestOptions);
    }

    /**
     * Deletes a new wiki page
     *
     * @param {string}  title
     * @param {string}  [reason]
     * @param {{}}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    delete(title, reason, customRequestOptions) {
        return this.request({
            action: 'delete',
            title: title,
            reason: reason || ''
        }, customRequestOptions);
    }

    /**
     * Edits a new wiki pages. Creates a new page if it does not exist yet
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {{}}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    edit(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || ''
        }, customRequestOptions);
    }


    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
    //////////////////////////////////////////

    /**
     * Merges two objects
     *
     * @param {{}} parent
     * @param {{}} child
     *
     * @returns {{}}
     */
    static merge(parent, child) {
        parent = parent || {};
        child = child || {};
        return Object.assign({}, parent, child);
    }
}

module.exports = MWBot;
