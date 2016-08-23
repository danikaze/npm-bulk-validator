# bulk-validator

Data validator which allows:
 - defining customizable validators (global and local)
 - defining aliases (global and local)
 - validate data in bulk operation
 - canonization of data
 - retrieve list of errors
 - retrieve list of valid values
 - allow optional data and default values
 - perform strict/non-strict validation

## Contents

  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Validator global options](#validator-global-options)
    - [strict](#strict)
    - [canonize](#canonize)
    - [returnNullOnErrors](#returnnullonerrors)
    - [stopAfterFirstError](#stopafterfirsterror)
    - [optional](#optional)
    - [defaultValue](#defaultvalue)
    - [validators](#validators)
    - [allowOverwriteValidator](#allowoverwritevalidator)
  - [List of default validators](#list-of-default-validators)
    - [defined](#defined)
    - [bool](#bool)
    - [num](#num)
    - [str](#str)
    - [fn](#fn)
    - [enumerated](#enumerated)
    - [enumeratedKey](#enumeratedkey)
    - [enumeratedKeyValue](#enumeratedkeyvalue)
    - [json](#json)
  - [List of default aliases](#list-of-default-aliases)
    - [notEmptyStr](#notemptystr)
    - [positiveInt](#positiveint)
  - [Defining aliases](#defining-aliases)
  - [Defining custom validators](#defining-custom-validators)
  - [Running tests](#running-tests)

## Installation

Install with [npm](https://www.npmjs.com/)
```
npm install bulk-validator
```

## Basic Usage

```javascript
var Validator = require('bulk-validator').Validator;
var weekDays = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };

// perform data validation of some common data in a bulk operation
var validator = new Validator();

validator.str('name', 'Daniel Berlanga')
         .num('luckyNumber', '7')
         .str('birthday', '1801-04-09', { regExp: /\d{4}-\d{2}-\d{2}/ })
         .bool('male', 1).
         .enumeratedKeyValue('day', 'FRI', { enumerated: weekDays });

// check for errors
if(validator.errors()) {
  return {
    status: 'error',
    errors: validator.errors(),
  };
}

// get the valid data
var validData = validator.valid();
/*
 // note how luckyNumber and male have been converted to Number and Boolean
 // day also has been returned as its enumerated value instead of the key
 {
   "name": "Daniel Berlanga",
   "luckyNumber": 7,
   "birthday": "1801-04-09",
   "male": true,
   "day": 4
 }
*/
```

## Validator global options

This is  the list of global options of the validators.

They can be accessed and modified through the static object in `Validator.defaultOptions`,
which will be applied to all the new instances created.

Instances created before modifying this object won't be affected.

```javascript
Validator.defaultOptions.optional = false;
var v1 = new Validator();
Validator.defaultOptions.optional = true;
var v2 = new Validator();
// v1 still has optional set to false
// v2 has optional set to true by default
```

This options can be overridden in each validation like this:
```javascript
var v = new Validator({
  defaultValue: -1,
  returnNullOnErrors: false
});

v.num('n1', 0)
 .num('n2', undefined)
 .num('n3', undefined, { optional: true })
 .num('n4', undefined, { optional: true, defaultValue: 100 });

v.valid();  // { n1: 0, n3: -1, n4: 100 }
v.errors(); // { n2: undefined }
```

### strict

If set to `true`, default validators will usually apply strict comparison/validation
(i.e. using `===` instead of `==`, or doing type checking).

It's also one of the options passed to the custom validators, and can/need be used when
implementing them.

Default value: `false`

### canonize

When `true`, if the data is valid, it's value will be converted to the one returned by the
validator. If `false`, the data will be validated but the original will be preserved
(i.e. `v.num('n', '123')` will return `123` or `'123'` depending on this option)

Default value: `true`

### returnNullOnErrors

If this option is `true` and any of the passed data fails the validation, calling `valid()`
will return `null`. Set to `false` if you still want to retrieve the valid values.

Default value: `true`

### stopAfterFirstError

If you don't care about providing (a lot of) information of the failed validation, you
can set this option to `true` and no other validation will be performed once there's an error.

This should give you a few more free CPU cycles ;)

Default value: `false`

### optional

Mark the data as optional (all of them is specified in `Validator.defaultOptions`, the
options passed to the Validator constructor, or only a parameter if passed to a validation
method.

If `true`, a validation won't fail if the data value is `undefined` and the data
will be asigned with `defaultValue` if specified.

It will still fail for other values like `null`, `0`, `false`, etc.

Default value: `false`

### defaultValue

If `options.optional` is set to `true` and the data is `undefined`, it will be assigned
with the value defined here.

Example:
```javascript
v = new Validator();
v.str('data', undefined, {
  optional: true,
  defaultValue: 'hello world'
});

// v.valid().data === 'hello world'
```

Default value: `undefined`

### validators

List of validators to add *locally* to a new Validator when instanciated.
It should be defined as set like `{ name: definition }`

Example:
```javascript
var v = new Validator({ validators: {
  allPass: function(data, options) {
    return {
      data: data,
      valid: true
    };
  }
}});

v.allPass('foo', 'bar');
v.allPassArray('foo', ['bar']);
v.allPassObject('foo', { k: 'bar' });
```

Default value: `undefined`

### allowOverwriteValidator

This option protects the already created validators.

Set it to `true` if you wanna get rid of any of them or override its behavior with a custom one.

**Note:**
it will raise an `Error` if you try to override any method with this option set to `false`.

Default value: `false`

## List of default validators

### defined

### bool

### num

### str

### fn

### enumerated

### enumeratedKey

### enumeratedKeyValue

### json

## List of default aliases

### notEmptyStr

### positiveInt

## Defining aliases

You can define your own aliases to call existing validators (or other aliases) with predefined options.

They can be created as global validators (defined in the prototype) with `Validator.addAlias`
or locally (defined in an instance v) with `v.addAlias`

```javascript
var Validator = require('bulk-validator').Validator;

// define a global validator for phone numbers
// (in Japan phone numbers are like XXX-XXXX-XXXX)
var alias = 'phone';
var validator = 'str';
var options = { regExp: /^\d{3}-\d{4}-\d{4}$/ };

// using the static function addAlias define the validator in the prototype
Validator.addAlias(alias, validator, options);

// now we can use it like this:
var v1 = new Validator();
var v2 = new Validator();
v1.phone('foo', '080-1234-5678') // this will validate
  .phone('bar', '1234-5678');    // this won't validate

typeof v1.phone; // function
typeof v2.phone; // function

// we can create a local validator too, like this:
v1.addAlias('int', 'num', { integer: true });

// it won't be defined in the Validator.prototype
typeof v1.int; // 'function'
typeof v2.int; // 'undefined'
```

You can see more examples in [aliases.js](https://github.com/danikaze/npm-bulk-validator/blob/master/aliases.js)

## Defining custom validators

If you need a more complex validator, you can create your own too!

They can be created as global validators (defined in the prototype) with `Validator.addValidator`
or locally (defined in an instance v) with `v.addValidator`

A validator is just a function accepting two parameters and returning an object:
`(data, options) => { data, valid }`

- input:
  - `data` is the data to validate
  - `options` is an object with the options specified when creating the validator or calling the method
- output:
  - `data` is the canonized data (type casting, etc.)
  - `valid` is a Boolean saying if the data passes the validation

It's easier to understand with examples:

This validator will pass everything but the number `0` (and making use of the `strict` option)

```javascript
// validator definition
function allButZero(data, options) {
  return {
    data: data,
    valid: (options.strict && data !== 0) || (!options.strict && data!= 0)
  };
}

// validator addition (as a global definition called allButZero)
Validator.addValidator('allButZero', allButZero);

// validator usage:
v = new Validator({ returnNullOnErrors: false, strict: false });
v.allButZero('n1', 1)
 .allButZero('n2', 0)
 .allButZero('n3', "0")
 .allButZero('n4', "0", { strict: true });

v.valid();  // { n1: 1, n4: "0" }
v.errors(); // { n2: 0, n3: "0" }
```

This other validator will accept only a list of comma-separated numbers whose addition is an even number.

If `options.odd` is `true`, it will pass the validation if the total is an odd number instead of even.

It will also convert the data to the said total.

```javascript
// validator definition
function exampleValidator(data, options) {
  var ok = true;
  var total = 0;
  var list;

  if (typeof data !== 'string') {
    ok = false;
  } else {
    list = data.split(',');
    list.every(function(n) {
      n = parseInt(n);
      if (isNaN(n)) {
        ok = false;
        return false;
      }
      total += n;
      return true;
    });
    if (ok) {
      ok = total % 2 === (options.odd ? 1 : 0);
    }
  }

  return {
    data: total,
    valid: ok,
  };
}

// validator addition (as a global definition called sumEven)
Validator.addValidator('sumEven', exampleValidator);

// validator usage:
v = new Validator({ returnNullOnErrors: false });
v.sumEven('pass', '1,3,-1,5')             // 1 + 3 - 1 + 5 = 8 (even number: ok)
 .sumEven('odd', '1,2,4', { odd: true })  // 1 + 2 + 4 = 7 (odd number: ok in this case)
 .sumEven('fail', '-3,2,8');              // -3 + 2 + 8 = 7 (odd number: fail)

v.valid();  // { pass: 8, odd: 7 }
v.errors(); // { fail: '-3,2,8' }
```

You can see more examples in [definitions.js](https://github.com/danikaze/npm-bulk-validator/blob/master/definitions.js)

## Running tests

Install dev dependencies

```
npm install -d && npm test
```
