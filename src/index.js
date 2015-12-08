'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');

class MWBot {

    constructor(options) {

        this.state = false;

        this.customSettings = options;

        this.defaultRequestOptions = {
            method: 'POST',
            jar: true,
            qs: {
                format: 'json'
            },
            form: {

            },
            json: true
        };

        if (options && options.request) {
            this.defaultRequestOptions = this.merge(this.defaultRequestOptions, options.request)
        }

    }


    login(loginOptions) {

        this.state = {};

        this.loginPromise = new Promise((resolve, reject) => {

            // TODO: Better Validation
            if (!loginOptions.apiUrl) {
                return reject('No apiUrl provided!');
            } else if (!loginOptions.username ) {
                return reject('No username provided!');
            } else if (!loginOptions.password) {
                return reject('No password provided!');
            }

            this.defaultRequestOptions.url = loginOptions.apiUrl;

            console.log(' ');
            console.log('LOGIN-OPTIONS');
            console.log(loginOptions);


            let loginRequest = this.merge(this.defaultRequestOptions, {
                qs: {
                    action: 'login',
                    lgname: loginOptions.username,
                    lgpassword: loginOptions.password
                }
            });

            rp(loginRequest)

                .then((response) => {

                    console.log(' ');
                    console.log('FIRST LOGIN');
                    console.log(response);
                    this.state = this.merge(this.state, response.login);

                    // Add token and re-submit login request
                    loginRequest.qs.lgtoken = response.login.token;

                    return rp(loginRequest);
                })

                .then((response) => {

                    console.log(' ');
                    console.log('SECOND LOGIN');
                    console.log(response);
                    this.state = this.merge(this.state, response.login);

                    if (response.login && response.login.result === 'Success') {

                        // MW 1.8 - 1.19
                        let getEditToken = this.merge(this.defaultRequestOptions, {
                            qs: {
                                action: 'query',
                                meta: 'tokens',
                                type: 'csrf'
                            }
                        });

                        return rp(getEditToken);


                    } else {
                        console.log('Could not login!');
                    }

                })
                .then((response) => {
                    console.log(' ');
                    console.log('EDIT TOKEN');
                    console.log(response);

                    if (response.query && response.query.tokens && response.query.tokens.csrftoken) {
                        this.defaultRequestOptions.form.token = response.query.tokens.csrftoken;
                    }

                    this.state = this.merge(this.state, response.query.tokens);


                    console.log(' ');
                    console.log(' ');
                    console.log('LOGIN STATE');
                    console.dir(this.state);

                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                })
            ;

        });

        return this.loginPromise;

    };


    rawRequest(requestOptions) {
        return rp(requestOptions);
    };


    request(qs, requestOptions) {

        return new Promise((resolve, reject) => {

            requestOptions = requestOptions || {};

            let requestObj = this.merge(this.defaultRequestOptions, requestOptions);

            requestObj.qs = this.merge(requestObj.qs, qs);

            console.log(' ');
            console.log('NEW REQUEST');
            console.dir(requestObj);

            rp(requestObj).then((response) => {

                resolve(response);
            });


        });
    };



    merge(parent, child) {
        return _.merge(_.cloneDeep(parent), _.cloneDeep(child));
    };
}

module.exports = MWBot;
