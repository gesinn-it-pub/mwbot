'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai');

describe('MWBot', function() {

    it('can be constructed', function() {
        let bot = new MWBot({});
    });

    it('respond with matching records', function(done) {


        let bot = new MWBot();

        bot.login({
            apiUrl: 'http://localhost:8080/wiki01/api.php',
            username: 'Admin',
            password: 'puppet'
        }).then((data) => {
            console.dir(data);

            return bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext=',
                summary: 'Test Edit'

            });
        }).then((data) => {
            console.dir(data);

            done();
        });

    });



});
