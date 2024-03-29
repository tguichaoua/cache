<h1 align="center">Welcome to cache 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/@baanloh/cache" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/@baanloh/cache.svg?style=for-the-badge" height="20">
  </a>
  <a href="https://github.com/tguichaoua/cache#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?style=for-the-badge" height="20" />
  </a>
  <a href="https://github.com/tguichaoua/cache/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-no-lightgrey.svg?style=for-the-badge" height="20" />
  </a>
  <a href="https://github.com/tguichaoua/cache/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/tguichaoua/cache?style=for-the-badge" height="20" />
  </a>
</p>

> Key-value pair cache with ttl.

## Install

```sh
npm i @baanloh/cache
```

## Documentation

### Example

```ts
import { Cache } from '@baanloh/cache';

// create a cache with default ttl to 10 minutes
const cache = new Cache<string, string>(1000 * 60 * 10);

// subscribe to delete event.
// can be used to perform specific action if the element is deleted by ttl.
cache.on('delete', (k, v) => {
    console.log(`deleted ${k}: ${v}`);
});

cache.set('A', 'Foo'); // add an element to the cache

cache.set('B', 'Goo', 1000 * 60); // add an element with a ttl of 1 minute

cache.set('A', 'Hoo'); // replace value of A. delete event is called.

cache.get('A'); // get an element from cache.

cache.has('A'); // check if cache has key.

cache.delete('A'); // remove an element from cache.

cache.clear(); // clear the cache.

// restart ttl
const foo = cache.get('foo', true); // get foo and restart its ttl with default ttl.
const goo = cache.get('goo', 1000 * 60); // get goo and restart its ttl at 1 minute.
const hasFoo = cache.restart('foo'); // restart foo ttl with default ttl.
const hasGoo = cache.restart('goo', 1000 * 60); // restart goo ttl at 1 minute.
```

### Events

|   name   | description                                                                                                                                 |
| :------: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `delete` | Called when an element is delete from the cache. Either with `delete` method, ttl or `set` method (if the key already contains an element). |

## Author

👤 **Tristan Guichaoua**

-   Github: [@tguichaoua](https://github.com/tguichaoua)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/tguichaoua/cache/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Tristan Guichaoua](https://github.com/tguichaoua).<br />
This project is [MIT](https://github.com/tguichaoua/cache/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
