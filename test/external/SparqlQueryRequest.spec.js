import MWBot from '../../src/index.js';

import * as chai from 'chai';
const expect = chai.expect;

describe('MWBot SPARQL Query Request', function () {
    it('queries wikidata for cats', async function () {
        this.timeout(8000);

        const bot = new MWBot();

        const endPoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';
        const query = `
            PREFIX wd: <http://www.wikidata.org/entity/>
            PREFIX wdt: <http://www.wikidata.org/prop/direct/>
            PREFIX wikibase: <http://wikiba.se/ontology#>

            SELECT ?catLabel WHERE {
                ?cat  wdt:P31 wd:Q146 .

                SERVICE wikibase:label {
                    bd:serviceParam wikibase:language "en" .
                }
            }
        `;

        const response = await bot.sparqlQuery(query, endPoint);

        expect(response).to.be.instanceof(Object);
        expect(response).to.include.key('results');
        expect(response.results).to.include.key('bindings');
        expect(response.results.bindings).to.be.an('array').that.is.not.empty;
    });
});
