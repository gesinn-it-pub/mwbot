'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;


describe('MWBot Request', function() {


    it('cannot edit a page without beeing logged in', function(done) {

        let bot = new MWBot();

        bot.request({
            action: 'edit',
            title: 'Main_Page',
            text: '=Some Wikitext=',
            summary: 'Test Edit'
        }).catch((err) => {
            expect(err).to.include('Must be logged in');
            done();
        });
    });


    it('respond with matching records', function(done) {


        exports.bot = new MWBot();

        exports.bot.login({
            apiUrl: 'http://localhost:8080/wiki01/api.php',
            username: 'Admin',
            password: 'puppet'

        }).then((data) => {

            return exports.bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext 2=',
                summary: 'Test Edit'

            });
        }).then((data) => {
            console.dir(data);

            done();
        });

    });



});
