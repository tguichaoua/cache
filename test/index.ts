import { Cache } from '../src/index';

const cache = new Cache<string, string>(3 * 1000);

cache.on('delete', (k, v) => {
    console.log('delete', k, v);
});

function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    cache.set('A', 'foo');
    await delay(1000);
    cache.set('B', 'goo');
    await delay(5000);
})();
