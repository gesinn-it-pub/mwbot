/**
 * Maps over an iterable sequentially, awaiting each item before starting the next.
 *
 * @param {Iterable} iterable
 * @param {Function} mapper
 * @returns {Promise<Array>}
 */
async function pMapSeries(iterable, mapper) {
    const results = [];
    for (const item of iterable) {
        results.push(await mapper(item));
    }
    return results;
}

export default pMapSeries;
