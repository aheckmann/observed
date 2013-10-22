#observed

ES6 `Object.observe` with nested object support; e.g. the way I want it.

## what?

Do you dream of observing a plain javascript object for changes and reacting to it later? Now you can.

Hiding being the `--harmony` flag of Node 0.11, the [Object.observe](http://wiki.ecmascript.org/doku.php?id=harmony:observe) gem resides.

`Object.observe` allows us to register a listener for any type of change to a given object.

```js
// node --harmony

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
// node --harmony

var o = { nested: { deeper: true }};
Object.observe(o, function (changes) {
  console.log(changes);
})
o.nested.deeper = false
// crickets ..
```

Turns out they don't. That's what `observed` is for: watching objects for changes without having to care about whether or not they have nested objects and arrays.

## usage

`observed` returns an `EventEmitter` which you listen to for changes.
There are four classes of events, mirroring `Object.observe`

- `new`
- `updated`
- `deleted`
- `reconfigured`

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

## use cases

1. passing object changes down to a browser in realtime using something like [primus](https://github.com/primus/primus).
2. fanning out object changes across multiple nodes using something like [axon](https://github.com/visionmedia/axon).
3. buffering changes and pass them off to your database of choice in one `save` action.

## features

1. Object tracking: Using ES6 `Object.observe` we provide support for rich object tracking without manual getters/setters.
2. Unobtrusive: Your object remains untouched and you may work with it as a plain js object.
3. Events: Receive an `EventEmitter` back which emits the following events:

- `added`
- `removed`
- `changed`
- `reconfigured`

## harmonious

You must run node using the `--harmony` flag to use this module.

```
> node --harmony yourProgram.js
```

## tests

Run em with `npm test`

## license

[MIT](https://github.com/aheckmann/observed/blob/master/LICENSE)

