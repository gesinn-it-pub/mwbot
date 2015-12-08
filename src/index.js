'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');

class MWBot {

    constructor(options) {
        this.options = options;
    }


    login() {

        return new Promise((resolve, reject) => {

            let options = this.options;



            console.log(' ');
            console.log('OPTIONS');
            console.log(options);

            let defaultOptions = {
                method: 'POST',
                jar: true,
                uri: options.apiUrl,
                qs: {
                    format: 'json'
                },
                json: true
            };


            let firstLogin = this.merge(defaultOptions, {
                qs: {
                    action: 'login',
                    lgname: options.username,
                    lgpassword: options.password
                }
            });


            rp(firstLogin)

                .then((response) => {
                    console.log(' ');
                    console.log('FIRST LOGIN');
                    console.log(response);

                    firstLogin.qs.lgtoken = response.login.token;
                    exports.token = response.login.token;

                    //console.log(firstLogin);

                    return rp(firstLogin);
                })

                .then((response) => {

                    console.log(' ');
                    console.log('SECOND LOGIN');
                    console.log(response);

                    if (response.login && response.login.result === 'Success') {

                        // MW 1.8 - 1.19
                        let getEditToken = this.merge(defaultOptions, {
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

                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                })
            ;

        });



    }

    merge(parent, child) {
        'use strict';
        return _.merge(_.cloneDeep(parent), _.cloneDeep(child));
    };
}

module.exports = MWBot;
