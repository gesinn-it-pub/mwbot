'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai');

describe('MWBot', function() {

    it('can be constructed', function() {
        let bot = new MWBot({});
    });

    it('respond with matching records', function(done) {


        let bot = new MWBot({
            apiUrl: 'http://localhost:8080/wiki01/api.php',
            username: 'Admin',
            password: 'puppet'
        });

        bot.login().then((data) => {
            done();
        });

    });


});
