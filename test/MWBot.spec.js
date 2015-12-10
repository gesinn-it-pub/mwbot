'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

describe('MWBot', function() {

    it('can be constructed', function() {
        let bot = new MWBot();
        expect(bot).to.be.an('object');
    });

    it('can be constructed with options', function() {
        let bot = new MWBot({
            verbose: true
        });
        expect(bot).to.be.an('object');
        expect(bot.options.verbose).to.equal(true);
    });

    it('has a valid semver version number', function() {
        let bot = new MWBot();
        expect(bot.version).to.be.a('string');
        expect(bot.version).to.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
    });

    it('set custom options', function() {
        let bot = new MWBot();
        bot.setOptions({
            verbose: true
        });
        expect(bot).to.be.an('object');
        expect(bot.options.verbose).to.equal(true);
    });

    it('set custom global request options', function() {
        let bot = new MWBot();
        bot.setGlobalRequestOptions({
            time: false,
            someNewOption: true
        });
        expect(bot).to.be.an('object');
        expect(bot.globalRequestOptions.time).to.equal(false);
        expect(bot.globalRequestOptions.someNewOption).to.equal(true);
    });

});
