#observed

ES6 `Object.observe` with nested object support; e.g. the way I want it.

[![Build Status](https://travis-ci.org/aheckmann/observed.svg?branch=master)](https://travis-ci.org/aheckmann/observed)

## What?

Do you dream of observing a plain javascript object for changes and reacting to it later? Now you can.

Available in **Node >= 0.11.13**, the standards compliant [Object.observe](http://wiki.ecmascript.org/doku.php?id=harmony:observe) treasure resides.

`Object.observe` allows us to register a listener for any type of change to a given object.

```js
var o = { name: 'harmony' };
Object.observe(o, function (changes) {
  console.log(changes);
})
o.name = 'ES6!'
o.kind = 'observed';

// logs..
// [ { type: 'update',
//     object: { name: 'ES6!', kind: 'observed' },
//     name: 'name',
//     oldValue: 'harmony' },
//   { type: 'add',
//     object: { name: 'ES6!', kind: 'observed' },
//     name: 'kind' } ]
```

You'll notice our callback received an array of all changes that occured. Cool.
But what about nested objects? Do they get automatically observed as well?

```js
var o = { nested: { deeper: true }};
Object.observe(o, function (changes) {
  console.log(changes);
})
o.nested.deeper = false
// crickets ..
```

Turns out they don't. And that's what `observed` is for: watching object modifications without having to care about whether or not they have nested objects and arrays.

## Usage

`observed` returns an `EventEmitter` which you listen to for changes.
There are five classes of events, closely mirroring `Object.observe`

- `add`
- `update`
- `delete`
- `reconfigure`
- `change` - fired when any of the above events are emitted

```js
var O = require('observed')
var object = { name: {} }
var ee = O(object)

ee.on('add', console.log)

object.name.last = 'observed'

// logs
// { path: 'name.last',
//   name: 'last',
//   type: 'add',
//   object: { last: 'observed' },
//   value: 'observed',
//   oldValue: undefined }
```

You'll notice we now receive more information compared to `Object.observe`

- `path`: full path to the property, including nesting
- `name`: name of the path reported by `Object.observe`
- `type`: name of the event reported by `Object.observe`
- `object`: object reported from `Object.observe`
- `value`: current value for the given `path`. same as `object[name]`
- `oldValue`: previous value of the property as reported by `Object.observe`

You may also listen for changes to specific paths:

```js
var O = require('observed')
var object = { name: { last: 'Heckmann', first: 'aaron' }}
var ee = O(object)

ee.on('update name.first', console.log)

object.name.first = 'Aaron'

// logs
// { path: 'name.first',
//   name: 'first',
//   type: 'update',
//   object: { last: 'Heckmann', first: 'Aaron' },
//   value: 'Aaron',
//   oldValue: 'aaron' }
```

### deliverChanges()

There are occasions where we want to immediately force all pending changes to
emit instead of waiting for the next turn of the event loop. `observed` has
us covered here too. Just call its `deliverChanges()` method and all pending
changes will emit.

```js
var O = require('observed');
var obj = { movie: { title: 'Godzilla' }};
var ee = O(obj);

var emitted = false;
ee.on('change', function(){ emitted = true });

obj.movie.year = 2014;
assert.equal(false, emitted);

ee.deliverChanges();
assert.equal(true, emitted);
// :)
```

## Use cases

1. passing object changes down to a browser in realtime using something like [primus](https://github.com/primus/primus).
2. fanning out object changes across multiple nodes using something like [axon](https://github.com/visionmedia/axon).
3. buffering changes and pass them off to your database of choice in one `save` action.

## Features

1. Object tracking: Using ES6 `Object.observe` we provide support for rich object tracking without manual getters/setters.
2. Unobtrusive: Your object remains untouched and you may work with it as a plain js object.
3. Events: Receive an `EventEmitter` back which emits the following events:

- `add`
- `update`
- `delete`
- `reconfigure`
- `change` - fired when any of the above events are emitted

## Node version requirements

`Object.observe` is available by default in Node >= `0.11.13`.

```
> node yourProgram.js
```

If you are running Node `>= 0.11.0 < 0.11.13` you must run Node using the `--harmony` flag
and use a `0.0.n` version of this module.

```
> npm install observed@0.0.3
> node --harmony yourProgram.js
```

## Tests

Run em with `npm test`

## License

[MIT](https://github.com/aheckmann/observed/blob/master/LICENSE)

