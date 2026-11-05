import MWBot from '../../src/index.js';

import * as chai from 'chai';
const expect = chai.expect;

describe('MWBot ASK Query Request', function () {
    it('queries semantic-mediawiki for cities', async function () {
        this.timeout(8000);

        const bot = new MWBot();

        const apiUrl = 'https://www.semantic-mediawiki.org/w/api.php';

        const query = `
            [[Category:City]]
            [[Located in::Germany]] 
            |?Population 
            |?Area#km² = Size in km²
        `;

        const response = await bot.askQuery(query, apiUrl);

        expect(response).to.be.instanceof(Object);
        expect(response.query).to.be.instanceof(Object);
        expect(response.query.printrequests).to.be.instanceof(Object);
        expect(response.query.results).to.be.instanceof(Object);
        expect(response.query.results['Demo:Berlin']).to.be.instanceof(Object);
    });

    it('queries semantic-mediawiki for cities using setApiUrl()', async function () {
        this.timeout(8000);

        const bot = new MWBot();

        bot.setApiUrl('https://www.semantic-mediawiki.org/w/api.php');

        const query = `
            [[Category:City]]
            [[Located in::Germany]] 
            |?Population 
            |?Area#km² = Size in km²
        `;

        const response = await bot.askQuery(query);

        expect(response).to.be.instanceof(Object);
        expect(response.query).to.be.instanceof(Object);
        expect(response.query.printrequests).to.be.instanceof(Object);
        expect(response.query.results).to.be.instanceof(Object);
        expect(response.query.results['Demo:Berlin']).to.be.instanceof(Object);
    });
});
