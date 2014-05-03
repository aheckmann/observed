#observed

ES6 `Object.observe` with nested object support; e.g. the way I want it.

[![Build Status](https://travis-ci.org/aheckmann/observed.svg?branch=master)](https://travis-ci.org/aheckmann/observed)

## What?

Do you dream of observing a plain javascript object for changes and reacting to it later? Now you can.

Available in **Node >= 0.11.3**, the [Object.observe](http://wiki.ecmascript.org/doku.php?id=harmony:observe) gem resides.

`Object.observe` allows us to register a listener for any type of change to a given object.

```js
var o = { name: 'harmony' };
Object.observe(o, function (changes) {
  console.log(changes);
})
o.name = 'ES6!'
o.kind = 'observed';

// logs..
// [ { type: 'updated',
//     object: { name: 'ES6!', kind: 'observed' },
//     name: 'name',
//     oldValue: 'harmony' },
//   { type: 'new',
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

- `new`
- `updated`
- `deleted`
- `reconfigured`
- `changed` - fired when any of the above events are emitted

```js
var O = require('observed')
var object = { name: {} }
var ee = O(object)

ee.on('new', console.log)

object.name.last = 'observed'

// logs
// { path: 'name.last',
//   name: 'last',
//   type: 'new',
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

ee.on('updated name.first', console.log)

object.name.first = 'Aaron'

// logs
// { path: 'name.first',
//   name: 'first',
//   type: 'updated',
//   object: { last: 'Heckmann', first: 'Aaron' },
//   value: 'Aaron',
//   oldValue: 'aaron' }
```

## Use cases

1. passing object changes down to a browser in realtime using something like [primus](https://github.com/primus/primus).
2. fanning out object changes across multiple nodes using something like [axon](https://github.com/visionmedia/axon).
3. buffering changes and pass them off to your database of choice in one `save` action.

## Features

1. Object tracking: Using ES6 `Object.observe` we provide support for rich object tracking without manual getters/setters.
2. Unobtrusive: Your object remains untouched and you may work with it as a plain js object.
3. Events: Receive an `EventEmitter` back which emits the following events:

- `new`
- `updated`
- `deleted`
- `reconfigured`
- `changed` - fired when any of the above events are emitted

## Node version requirements

`Object.observe` is available by default in Node >= `0.11.3`.

If you are running Node `0.11.{0,1,2}` you must run Node using the `--harmony` flag to use this module.

```
> node --harmony yourProgram.js
```

## Tests

Run em with `npm test`

## License

[MIT](https://github.com/aheckmann/observed/blob/master/LICENSE)

