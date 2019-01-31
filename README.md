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
    - [returnUndefined](#returnundefined)
    - [validators](#validators)
    - [allowOverwriteValidator](#allowoverwritevalidator)
    - [preTransform](#pretransform)
    - [preTransformItem](#pretransformitem)
    - [postTransformItem](#posttransformitem)
    - [postTransform](#posttransform)
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
  - [Defining and using schemas](#defining-and-using-schemas)
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

### returnUndefined

If a value is validated with `undefined`, and this option is `false`, it won't be included in the list of valid values.

This is useful when we want define a schema with optional values, and we set `options.optional` to `true`.

Default value: `true`

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

### preTransform

Setting this option to a function, you can set it to be called everytime a validation is going to be done, **before** it happens. The input data is the raw value to be validated, and the result is the actual value that is going to be passed to the validator.

Example
```javascript
// get the data and return it times 10
function times10(data) {
  return data * 10;
}

// validate only numbers greater or equal than 50
var v = new Validator();
// 10 without transform is 10
v.num('raw', 10, { min: 50 });
// 10 transformed, is 100
v.num('transformed', 10, { min: 50, preTransform: times10 });

// v.valid().transformed === 100
// v.errors().raw === 10
```

Applying it to the raw data means that if the data to validate is an array or an object, it's applied to the whole data itself, not to each of its elements.

```javascript
function addElement(data) {
  if (isArray(data)) {
    return data.concat([0]);
  } else if (isObject(data)) {
    return {
      extra: 0,
      ...data,
    };
  } else {
    return data;
  }
}

var v = new Validator({ preTransform: addElement });
v.num('single', 123);
v.numArray('list', [10, 20, 30]);
v.numObject('object', { a: 10, b: 20, c: 30 });

// v.valid() === {
//  single: 123,
//  list: [10, 20, 30, 0],
//  object: { a: 10, b: 20, c: 30, extra: 0 },
// }
```

If the transformation data triggers any error, the data won't validate.

Default value: `undefined`

### preTransformItem

Works like `preTransform` but the callback is applied to **each element** before the validation (but after `preTransform` is applied):

```javascript
// validate only numbers greater or equal than 50
var v = new Validator({ min: 50 });

v.num('single', 10);
v.num('list', [10, 20, 30]);
v.num('object', { a: 10, b: 20, c: 30 });
v.num('transformedSingle', 10, { preTransformItem: times10 });
v.num('transformedList', [10, 20, 30], { preTransformItem: times10 });
v.num('transformedObject', { a: 10, b: 20, c: 30 }, { preTransformItem: times10 });

// v.valid() === {
//  transformedSingle: 100,
//  transformedList: [100, 200, 300],
//  transformedObject: { a: 100, b: 200, c: 300 },
// }

// v.errors() === {
//  single: 10,
//  list: [10, 20, 30],
//  object: { a: 10, b: 20, c: 30 },
// }
```

### postTransformItem

Works like `preTransformItem` but the callback is applied to **each** item, after the validation.

### postTransform

Works like `preTransform` but the callback is applied just before the data is returned (and after all `preTransformItem` are applied).

## Notes about transformation functions

When applying transformations, the process is like described here:
1. Apply `preTransform` functions (if defined) to the raw data
2. Apply `preTransformItem` functions (if defined) to each raw item
3. Apply the validation to the data (each item for `~Array` and `~Object` variants)
4. Apply `postTransformItem` functions (if defined) to each validated item (if `canonized` option is `true`, _canonization_ will be done before this step)
5. Apply `postTransform` functions (if defined) to the final result before being stored in the valid item list

* For single validations, `preTransform` and `preTransformItem` are applied both, in that order.
* For single validations, `postTransformItem` and `postTransform` are applied both, in that order.
* If a transformation function fails (i.e. triggering an error), the validation fails (the data will be in `errors()`) without triggering any error

## List of default validators

### defined

The data will pass the validation if is not `undefined`.

### bool

The validation process will depend on the `strict` option.

If the `strict` is set to `true`, it will pass the validation only if it's type is strictly a `Boolean`.

If the `strict` is set to `false`, it will pass the validation always.
Also, its value will be set to the casting of the data (i.e. `0` will be `false`, `1` `true`).
In case of strings, it will evaluate to `true` if it's not `''`, `'false'` or `'0'`.

### num

The validation process will depend on the `strict` option.

When `strict` is set to `true`, it will only validate if it's a `number` ([isNumber](https://www.npmjs.com/package/vanilla-type-check)).
If `strict` is `false`, it will accept also _numeric_ values ([isNumeric](https://www.npmjs.com/package/vanilla-type-check)) and `Infinity`.

It accepts also other validation options:

  - **`rangeMin`** and **`rangeMax`**: If any of this options is set, it will only accept values greater/less than the specified (as _rangeMin < data < rangeMax_).
  - **`minEq`** and **`maxEq`**: By default this options are `false`, but if set to `true`, if set `rangeMin` or `rangeMax` will perform the comparisons with the `<=`/`>=` operators instead of `<`/`>`.
  - **`regExp`**: If this option is set (to a string or a valid RegExp), the data need to match it to pass thte validation.

There are also some options that don't accept the validation, but modificate the canonized value (when `canonize` is `true`):

 - **`integer`**: when set to `true` the data will be converted to integer (before applying any other condition)
 - **`min`** and `max`: it will clamp the data to avoid outer values

Examples:

```javascript
// Accept only numbers greater or equal than 10 and less than 20, which ends in ".0" or ".5"
var v = new Validator({
  rangeMin: 10,
  rangeMax: 20,
  minEq: true,
  regExp: '\.[35]$'
});
v.num('n1', 5.5)	  // fail: it's less than 10
 .num('n2', 10)		  // fail: don't match the regular expression
 .num('n3', 10.0)	  // fail: a number like this is passed as 10, not as 10.0
 .num('n4', '10.0')	// pass: it's a string but strict is set to false by default (and preserves the decimal part)
 .num('n5', 11.3)  	// fail: it doesn't match the regular expressoin
 .num('n6', 15.5)	  // pass
 .num('n7', 20.0);	// fail: it's equal to rangeMax, but it's compared with < and not with <=
```

```javascript
// accept all numeric values, setting them to 0 if negatives, and removing their decimal part
var v = new Validator({
  integer: true,
  min: 0
});
v.num('n1', -3)	                        // it will pass, and its value will be set to 0
 .num('n2', 1000)	                      // pass, there's no upper limit
 .num('n3', 10.5)	                      // pass and it's value will be set to 10 (integer)
 .num('n4', -5.9, { min: -Infinity });	// pass and it's value will be set to -5
```

### str

Accepts strings.

Like `num`, its validation process depends on the `strict` option: When `true` it will only accept data of the `string` type. If `false`, it will accept all kind of data that can be converted to `string`.

It accept also the following options:

  - **`minLength`**: If specified, the data won't validate unless its length is greater or equal than this option.
  - **`maxLength`**: If specified, the data won't validate unless its length is less than this option.
  - **`truncate`**: If `true` the string will pass the validation, but will be truncated.
  - **`append`**: If specified AND the string is truncated, this string will be appended. Nothing is appended if the string length is less than `maxLength` (see [truncate](https://www.npmjs.com/package/truncate)).
  - **`regExp`**: If specified, it needs to match the RegExp to validate. It's applied after `truncate`, but before `lowerCase` and `upperCase`.
  - **`lowerCase`**: If `true`, the string will be transformed to lower case.
  - **`upperCase`**: If `true`, the string will be transformed to upper case.

Examples:

```javascript
var v = new Validator({ returnNullOnErrors: false });
v.str('s0', '', { minLength: 3 })
 .str('s1', 'test string', { minLength: 3 })
 .str('s2', 'abcdefghijklmmnopqrstuvwxyz', { maxLength: 10 })
 .str('s3', 'abcdefghijklmmnopqrstuvwxyz', { maxLength: 10, truncate: true })
 .str('s4', 'abcdefghijklmmnopqrstuvwxyz', { maxLength: 10, truncate: true, append: '...' })
 .str('s5', 'AbCdE', { lowerCase: true });

v.valid();   // {
             //   s1: "test string"
             //   s3: "abcdefghij"
             //   s4: "abcdefghij..."
             //   s5: "abcde"
             // }
v.errors();  // {
             //   s0: '',
             //   s2: "abcdefghijklmmnopqrstuvwxyz"
             // }
```

### fn

This is a very simple validator that will pass the data only if they are functions. In this validator, the option `strict` has no effect.

```javascript
var v = new Validator();

v.fn('f1', function() {})    // pass, valid function
 .fn('f2', 'function() {}'); // fail (it's a string, not a function)
```

### enumerated

This validator checks that the passed data is one of the values defined in an object.
The `strict` option defines if the comparison should be done strictly (`===`) or not (`==`).

You need to pass the object where the definitions are in the `enumerated` option.

```javascript
var weekDays = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
var v = new Validator({ enumerated: weekDays, returnNullOnErrors: false });

v.enumerated('e1', 0)
 .enumerated('e2', 4)
 .enumerated('e3', weekDays.THU)
 .enumerated('e4', 'SUN')         // fail: SUN is not a value of the enumerated (is a key)
 .enumerated('e5', 'Friday')      // fail: Ok this has nothing to do here...
 .enumerated('e6', 10);           // fail: This value is not in the enumerated object

v.valid(); // { e1: 0, e2: 4, e3: 3 }
```

### enumeratedKey

This validator works like **enumerated**, but checks if the value is one of the keys of the object.

You need to pass the object where the definitions are in the `enumerated` option.

```javascript
var weekDays = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
var v = new Validator({ enumerated: weekDays, returnNullOnErrors: false });

v.enumeratedKey('e1', 'MON')
 .enumeratedKey('e2', 4)             // fail: 4 is a value, not a key
 .enumeratedKey('e3', weekDays.THU)  // fail: this resolves to 3, which is not a key
 .enumeratedKey('e4', 'SUN')
 .enumeratedKey('e5', 'Friday')      // fail: Ok this has nothing to do here...
 .enumeratedKey('e6', 'fri');        // fail: the key is defined as an upper case string

v.valid(); // { e1: 'MON', e4: 'SUN' }
```

### enumeratedKeyValue

This validator works the same that **enumeratedKey**, checking that the data is a key of the object,
but returning its associated value instead of the key itself.

```javascript
var weekDays = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
var v = new Validator({ enumerated: weekDays, returnNullOnErrors: false });

v.enumeratedKeyValue('e1', 'MON')
 .enumeratedKeyValue('e2', 4)             // fail: 4 is a value, not a key
 .enumeratedKeyValue('e3', weekDays.THU)  // fail: this resolves to 3, which is not a key
 .enumeratedKeyValue('e4', 'SUN')
 .enumeratedKeyValue('e5', 'Friday')      // fail: Ok this has nothing to do here...
 .enumeratedKeyValue('e6', 'fri');        // fail: the key is defined as an upper case string

v.valid(); // { e1: 0, e4: 6 }
```

### json

Validates data to be a correct JSON definition (using `JSON.parse`).
Doesn't accept any option, and returns the parsed JavaScript data.

Note that functions and `NaN` are not parseable by `JSON`, so they are not supported,
and will fail the validation.

```javascript
var v = new Validator();

v.json('data', '[1,2,3]');
v.valid().data[1]; // 2
```

## List of default aliases

### notEmptyStr

Alias using `str`, with default options to reject empty strings.

```javascript
var v = new Validator({ returnNullOnErrors: false });

v.notEmptyStr('s1', 'abcd')
 .notEmptyStr('s2', ' ')
 .notEmptyStr('s3', '')
 .notEmptyStr('n1', 2);

v.valid();   // { s1: 'abcd', s2: ' ' }
v.errors();  // { s3: '', n1: 2 }
```

### positiveInt

Alias using `num`, to accept only integers greater than 0

```javascript
var v = new Validator({ returnNullOnErrors: false });

v.positiveInt('n1', '123')
 .positiveInt('n2', 123)
 .positiveInt('n3', 1)
 .positiveInt('n4', 0)
 .positiveInt('n5', -1)
 .positiveInt('f1', 1.5)
 .positiveInt('f2', '6.5')
 .positiveInt('f3', 0.5)
 .positiveInt('f4', -1.5);

v.valid();   // { n1: 123, n2: 123, n3: 1, f1: 1, f2: 6 }
v.errors();  // { n4: 0, n5: -1, f3: 0.5, f4: -1.5 }
```

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

## Defining custom aliases

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

## Defining and using schemas

A schema is nothing else than a set of validations. It's very useful when trying to validate the same set of data everytime (i.e. data to be stored in a database, or data for a data model coming from user input).

As the validators and aliases, a schema can be defined locally to a Validator instance, or globally to the Validator class itself.

```js
var schemaDefinition = {
  foo: {
    validator: 'str'
  },
  bar: {
    validator: 'num',
    options: { defaultValue: 0 },
  },
};
var schemaOptions = {
  optional: true,
};

// defining a local validator schema
var v1 = new Validator();
var v2 = new Validator();
v1.addSchema('local-schema', schemaDefinition, schemaOptions);

// defining a global validator schema
Validator.addSchema('global-schema', schemaDefinition, schemaOptions);

// now we can use the schema like this:
var data = {
  foo: 'some text',
  bar: 123,
};

// we can use the previously defined local schema in v1
v1.schema('local-schema', data);
v1.valid(); // { foo: 'some text', bar: 123 }

// also, the global one in v1 and v2
v1.schema('global-schema', data);
v2.schema('global-schema', data);

// but using a local schema in a different instance will throw an error
v2.schema('local-schema', data); // error

// note that everytime we call .schema(), a .reset() call is done internally:
v1.schema('local-schema', { foo: 'abc', bar: 123 });
v1.valid(); // { foo: 'abc', bar: 123 }
v1.schema('local-schema', { foo: 'abc' });
v1.valid(); // { foo: 'abc', bar: 0 }
```

## Running tests

Install dev dependencies

```
npm install -d && npm test
```

## Change log

### 1.1.0

- Added `preTransform` and `postTransform` optional callbacks to validators
