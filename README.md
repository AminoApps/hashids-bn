**hashids-bn** is small JavaScript library to generate YouTube-like ids from numbers. This fork uses BigNumber so that number isn't limited.
[http://hashids.org/javascript](http://hashids.org/javascript)

Getting started
-------

Install Hashids via:

- [node.js](https://nodejs.org): `npm install --save hashids-bn`


This fork is only intended to use in nodejs server (> 10), but modern browser should also work.

Use in Node.js:

```javascript
var Hashids = require('hashids-bn');
var hashids = new Hashids();

console.log(hashids.encode(1));
```

Quick example
-------

```javascript
var hashids = new Hashids();

var id = hashids.encode(1, 2, 3); // o2fXhV
var numbers = hashids.decode(id); // [1, 2, 3]
```

More options
-------

**A few more ways to pass to `encode()`:**

```javascript
var hashids = new Hashids();

console.log(hashids.encode(1, 2, 3)); // o2fXhV
```

**Make your ids unique:**

Pass a project name to make your ids unique:

```javascript
var hashids = new Hashids('My Project');
console.log(hashids.encode(1, 2, 3)); // Z4UrtW

var hashids = new Hashids('My Other Project');
console.log(hashids.encode(1, 2, 3)); // gPUasb
```

**Use padding to make your ids longer:**

Note that ids are only padded to fit **at least** a certain length. It doesn't mean that your ids will be *exactly* that length.

```javascript
var hashids = new Hashids(); // no padding
console.log(hashids.encode(1)); // jR

var hashids = new Hashids('', 10); // pad to length 10
console.log(hashids.encode(1)); // VolejRejNm
```

**Pass a custom alphabet:**

```javascript
var hashids = new Hashids('', 0, 'abcdefghijklmnopqrstuvwxyz'); // all lowercase
console.log(hashids.encode(1, 2, 3)); // mdfphx
```

Default alphabet is `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`.


Pitfalls
-------

1. When decoding, output is always an array of numbers (even if you encode only one number):

	```javascript
	var hashids = new Hashids();

	var id = hashids.encode(1);
	console.log(hashids.decode(id)); // [1]
	```

2. Encoding negative numbers is not supported.
3. If you pass bogus input to `encode()`, a TypeError is raised:

	```javascript
	var hashids = new Hashids();

	var id = hashids.encode('123a'); // TypeError
	```

4. Do not use this library as a security tool and do not encode sensitive data. This is **not** an encryption library.

Randomness
-------

The primary purpose of Hashids is to obfuscate ids. It's not meant or tested to be used as a security or compression tool. Having said that, this algorithm does try to make these ids random and unpredictable:

No repeating patterns showing there are 3 identical numbers in the id:

```javascript
var hashids = new Hashids();
console.log(hashids.encode(5, 5, 5)); // A6t1tQ
```

Same with incremented numbers:

```javascript
var hashids = new Hashids();

console.log(hashids.encode(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)); // wpfLh9iwsqt0uyCEFjHM

console.log(hashids.encode(1)); // jR
console.log(hashids.encode(2)); // k5
console.log(hashids.encode(3)); // l5
console.log(hashids.encode(4)); // mO
console.log(hashids.encode(5)); // nR
```

Curses! #$%@
-------

This code was written with the intent of placing created ids in visible places, like the URL. Therefore, the algorithm tries to avoid generating most common English curse words by generating ids that never have the following letters next to each other:

	c, f, h, i, s, t, u

License
-------

MIT
