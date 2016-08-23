'use strict';
/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

describe('MWBot ASK Query Request', function() {
    'use strict';

    it('queries semantic-mediawiki for cities', function(done) {
        this.timeout(8000);

        let bot = new MWBot();

        let apiUrl = 'https://www.semantic-mediawiki.org/w/api.php';

        let query = `
            [[Category:City]]
            [[Located in::Germany]] 
            |?Population 
            |?Area#km² = Size in km²
        `;

        bot.askQuery(query, apiUrl).then((response) => {
            expect(response).to.be.instanceof(Object);
            expect(response.query).to.be.instanceof(Object);
            expect(response.query.printrequests).to.be.instanceof(Object);
            expect(response.query.results).to.be.instanceof(Object);
            expect(response.query.results['Demo:Berlin']).to.be.instanceof(Object);
            done();
        }).catch((e) => {
            log(e);
        });
    });

    it('queries semantic-mediawiki for cities using setApiUrl()', function(done) {
        this.timeout(8000);

        let bot = new MWBot();

        bot.setApiUrl('https://www.semantic-mediawiki.org/w/api.php');

        let query = `
            [[Category:City]]
            [[Located in::Germany]] 
            |?Population 
            |?Area#km² = Size in km²
        `;

        bot.askQuery(query).then((response) => {
            expect(response).to.be.instanceof(Object);
            expect(response.query).to.be.instanceof(Object);
            expect(response.query.printrequests).to.be.instanceof(Object);
            expect(response.query.results).to.be.instanceof(Object);
            expect(response.query.results['Demo:Berlin']).to.be.instanceof(Object);
            done();
        }).catch((e) => {
            log(e);
        });
    });
});

