'use strict';
/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

describe('MWBot SPARQL Query Request', function() {
    'use strict';

    it('queries wikidata for cats', function(done) {
        this.timeout(8000);

        let bot = new MWBot();

        let endPoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';
        let query = `
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

        bot.sparqlQuery(query, endPoint).then((response) => {
            expect(response).to.be.instanceof(Object);
            expect(response).to.include.key('results');
            expect(response.results).to.include.key('bindings');
            expect(JSON.stringify(response.results.bindings)).to.include('Grumpy Cat');
            done();
        }).catch((e) => {
            log(e);
        });

    });
});
