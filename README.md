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

Install with [npm](https://www.npmjs.com/)
```
npm install bulk-validator
```

## Usage

### Basic Usage

```javascript
var Validator = require('bulk-validator').Validator;
var weekDays = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };

// perform data validation of some common data in a bulk operation
var validator = new Validator();

validator.str('name', 'Daniel Berlanga')
         .num('luckyNumber', '7')
         .str('birthday', '1801-04-09', { regExp: /\d{4}-\d{2}-\d{2}/ })
         .bool('male', 1).
         .enumeratedKeyValue('day', 'FRI');

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

### Validator global options

#### strict

Default value: `false`

#### canonize

Default value: `true`

#### returnNullOnErrors

Default value: `true`

#### stopAfterFirstError

Default value: `false`

#### optional

Default value: `false`

#### validators

Default value: `{}`

#### allowOverwriteValidator

Default value: `false`

#### defaultValue

Default value: `undefined`

### List of default validators

#### defined

#### bool

#### num

#### str

#### fn

#### enumerated

#### enumeratedKey

#### enumeratedKeyValue

#### json

### List of default aliases

#### notEmptyStr

#### positiveInt

### Defining aliases

You can define your own aliases to call existing validators (or other aliases) with predefined options.
They can be created as global validators (defined in the prototype) with `Validator.addAlias`
or locally (defined in an instance v) with `v.addAlias`

```javascript
var Validator = require('bulk-validator').Validator;

// define a global validator for phone numbers
// (in Japan phone numbers are like XXX-XXXX-XXXX)
var alias = 'phone';
var validator = 'str';
var options = { regExp: '\d{3}-\d{4}-\d{4}' };

// using the static function addAlias define the validator in the prototype
Validator.addAlias(alias, validator, options);

// now we can use it like this:
var v1 = new Validator();
var v2 = new Validator();
v1.phone('foo', '080-1234-5678') // this will validate
  .phone('bar', '1234-5678');    // this won't validate

typeof v.phone; // function
typeof v2.phone; // function

// we can create a local validator too, like this:
v1.addAlias('int', 'num', { integer: true });

// it won't be defined in the Validator.prototype
typeof v1.int; // 'function'
typeof v2.int; // 'undefined'
```

You can see more examples in `aliases.js`

### Defining custom validators

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

An example is easier to understand.
This validator will accept only a list of comma-separated numbers whose addition is an even number.
If `options.odd` is `true`, it will pass the validation if the total is an odd number instead of even.
It will also convert the data to the said total.

```javascript
// validator definition
function exampleValidator(data, options) {
  var ok = true;
  var total = 0;
  var list;

  if (typeof options.data !== 'string') {
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

You can see more examples in `definitions.js`

## Running tests

Install dev dependencies

```
npm install -d && npm test
```
