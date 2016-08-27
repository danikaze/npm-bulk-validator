var expect = require('chai').expect;
var Validator = require('../index').Validator;

describe('validator basic definitions', function() {
  'use strict';
  var validator = new Validator();

  it('should have basic validators by default', function() {
    expect(validator.defined).to.be.a('function');
    expect(validator.bool).to.be.a('function');
    expect(validator.num).to.be.a('function');
    expect(validator.str).to.be.a('function');
    expect(validator.fn).to.be.a('function');
    expect(validator.enumerated).to.be.a('function');
    expect(validator.enumeratedKey).to.be.a('function');
    expect(validator.enumeratedKeyValue).to.be.a('function');
    expect(validator.json).to.be.a('function');
  });

  it('should have basic array validators by default', function() {
    expect(validator.definedArray).to.be.a('function');
    expect(validator.boolArray).to.be.a('function');
    expect(validator.numArray).to.be.a('function');
    expect(validator.strArray).to.be.a('function');
    expect(validator.fnArray).to.be.a('function');
    expect(validator.enumeratedArray).to.be.a('function');
    expect(validator.enumeratedKeyArray).to.be.a('function');
    expect(validator.enumeratedKeyValueArray).to.be.a('function');
    expect(validator.jsonArray).to.be.a('function');
  });

  it('should have basic object validators by default', function() {
    expect(validator.definedObject).to.be.a('function');
    expect(validator.boolObject).to.be.a('function');
    expect(validator.numObject).to.be.a('function');
    expect(validator.strObject).to.be.a('function');
    expect(validator.fnObject).to.be.a('function');
    expect(validator.enumeratedObject).to.be.a('function');
    expect(validator.enumeratedKeyObject).to.be.a('function');
    expect(validator.enumeratedKeyValueObject).to.be.a('function');
    expect(validator.jsonObject).to.be.a('function');
  });
});

describe('validator.defined', function() {
  'use strict';

  it('should detect defined and undefined data properly', function() {
    var validator = new Validator({ returnNullOnErrors: false });

    validator.defined('zero', 0)
             .defined('int', 123)
             .defined('float', 3.141592)
             .defined('true', true)
             .defined('false', false)
             .defined('string', 'str')
             .defined('emptyString', '')
             .defined('array', [1, 2, 3])
             .defined('emptyArray', [])
             .defined('object', { a: 1, b: 2, c: 3 })
             .defined('emptyObject', {})
             .defined('null', null)
             .defined('NaN', NaN)
             .defined('fn', function() {})
             .defined('undefined', undefined);

    expect(validator.valid().zero).to.equal(0);
    expect(validator.valid().int).to.equal(123);
    expect(validator.valid().float).to.equal(3.141592);
    expect(validator.valid().true).to.equal(true);
    expect(validator.valid().false).to.equal(false);
    expect(validator.valid().string).to.equal('str');
    expect(validator.valid().emptyString).to.equal('');
    expect(validator.valid().array).to.eql([1, 2, 3]);
    expect(validator.valid().emptyArray).to.eql([]);
    expect(validator.valid().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(validator.valid().emptyObject).to.eql({});
    expect(validator.valid().null).to.equal(null);
    expect(validator.valid().NaN).to.be.NaN;
    expect(validator.valid().fn).to.be.a('function');
    expect(validator.errors().undefined).to.equal(undefined);
  });

  it('should return the same with strict true or false', function() {
    var v1 = new Validator({ strict: true });
    var v2 = new Validator({ strict: false });

    v1.defined('data1', 1)
      .defined('data2', 'str');
    v2.defined('data1', 1)
      .defined('data2', 'str');

    expect(v1.valid()).not.to.be.null;
    expect(v1.valid()).not.to.be.empty;
    expect(v1.valid()).to.eql(v2.valid());
  });

  it('should return the same with canonize true or false', function() {
    var v1 = new Validator({ canonize: true });
    var v2 = new Validator({ canonize: false });

    v1.defined('data1', 1)
      .defined('data2', 'str');
    v2.defined('data1', 1)
      .defined('data2', 'str');

    expect(v1.valid()).not.to.be.null;
    expect(v1.valid()).not.to.be.empty;
    expect(v1.valid()).to.eql(v2.valid());
  });

  it('should return defaultValue if value is undefined', function() {
    var validator = new Validator({
      optional: true,
      defaultValue: 0,
    });

    validator.defined('data1', 1)
             .defined('data2', undefined);

    expect(validator.errors()).to.be.null;
    expect(validator.valid().data1).to.equal(1);
    expect(validator.valid().data2).to.equal(0);
  });
});

describe('validator.bool', function() {
  'use strict';

  it('should detect and get boolean data when strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
    });

    validator.bool('zero', 0)
             .bool('int', 123)
             .bool('float', 3.141592)
             .bool('true', true)
             .bool('trueString', 'true')
             .bool('falseString', 'false')
             .bool('trueInt', 1)
             .bool('falseInt', 0)
             .bool('trueIntString', '1')
             .bool('falseIntString', '0')
             .bool('false', false)
             .bool('string', 'str')
             .bool('emptyString', '')
             .bool('array', [1, 2, 3])
             .bool('emptyArray', [])
             .bool('object', { a: 1, b: 2, c: 3 })
             .bool('emptyObject', {})
             .bool('null', null)
             .bool('NaN', NaN)
             .bool('fn', function() {})
             .bool('undefined', undefined);

    expect(validator.valid().true).to.be.true;
    expect(validator.valid().false).to.be.false;

    expect(validator.errors().zero).to.equal(0);
    expect(validator.errors().int).to.equal(123);
    expect(validator.errors().float).to.equal(3.141592);
    expect(validator.errors().trueString).to.equal('true');
    expect(validator.errors().falseString).to.equal('false');
    expect(validator.errors().trueInt).to.equal(1);
    expect(validator.errors().falseInt).to.equal(0);
    expect(validator.errors().trueIntString).to.equal('1');
    expect(validator.errors().falseIntString).to.equal('0');
    expect(validator.errors().string).to.equal('str');
    expect(validator.errors().emptyString).to.equal('');
    expect(validator.errors().array).to.eql([1, 2, 3]);
    expect(validator.errors().emptyArray).to.eql([]);
    expect(validator.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(validator.errors().emptyObject).to.eql({});
    expect(validator.errors().null).to.equal(null);
    expect(validator.errors().NaN).to.be.a.NaN;
    expect(validator.errors().fn).to.be.a('function');
    expect(validator.errors().undefined).to.be.undefined;
  });

  it('should evaluate to boolean data when strict is false', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });

    validator.bool('zero', 0)
             .bool('int', 123)
             .bool('float', 3.141592)
             .bool('true', true)
             .bool('trueString', 'true')
             .bool('falseString', 'false')
             .bool('trueInt', 1)
             .bool('falseInt', 0)
             .bool('trueIntString', '1')
             .bool('falseIntString', '0')
             .bool('false', false)
             .bool('string', 'str')
             .bool('emptyString', '')
             .bool('array', [1, 2, 3])
             .bool('emptyArray', [])
             .bool('object', { a: 1, b: 2, c: 3 })
             .bool('emptyObject', {})
             .bool('null', null)
             .bool('NaN', NaN)
             .bool('fn', function() {})
             .bool('undefined', undefined);

    expect(validator.valid().zero).to.be.false;
    expect(validator.valid().int).to.be.true;
    expect(validator.valid().float).to.be.true;
    expect(validator.valid().true).to.be.true;
    expect(validator.valid().trueString).to.be.true;
    expect(validator.valid().falseString).to.be.false;
    expect(validator.valid().trueInt).to.be.true;
    expect(validator.valid().falseInt).to.be.false;
    expect(validator.valid().trueIntString).to.be.true;
    expect(validator.valid().falseIntString).to.be.false;
    expect(validator.valid().false).to.be.false;
    expect(validator.valid().string).to.be.true;
    expect(validator.valid().emptyString).to.be.false;
    expect(validator.valid().array).to.be.true;
    expect(validator.valid().emptyArray).to.be.true;
    expect(validator.valid().object).to.be.true;
    expect(validator.valid().emptyObject).to.be.true;
    expect(validator.valid().null).to.be.false;
    expect(validator.valid().NaN).to.be.false;
    expect(validator.valid().fn).to.be.true;
    expect(validator.valid().undefined).to.be.false;
  });
});

describe('validator.num', function() {
  'use strict';

  it('should detect numeric data and covert it when strict is false', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });

    validator.num('zero', 0)
             .num('int', 123)
             .num('float', 3.141592)
             .num('true', true)
             .num('trueString', 'true')
             .num('falseString', 'false')
             .num('trueInt', 1)
             .num('falseInt', 0)
             .num('trueIntString', '1')
             .num('falseIntString', '0')
             .num('false', false)
             .num('string', 'str')
             .num('emptyString', '')
             .num('array', [1, 2, 3])
             .num('emptyArray', [])
             .num('object', { a: 1, b: 2, c: 3 })
             .num('emptyObject', {})
             .num('null', null)
             .num('NaN', NaN)
             .num('fn', function() {})
             .num('undefined', undefined);

    expect(validator.valid().zero).to.equal(0);
    expect(validator.valid().int).to.equal(123);
    expect(validator.valid().float).to.equal(3.141592);
    expect(validator.errors().true).to.equal(true);
    expect(validator.errors().trueString).to.equal('true');
    expect(validator.errors().falseString).to.equal('false');
    expect(validator.valid().trueInt).to.equal(1);
    expect(validator.valid().falseInt).to.equal(0);
    expect(validator.valid().trueIntString).to.equal(1);
    expect(validator.valid().falseIntString).to.equal(0);
    expect(validator.errors().false).to.equal(false);
    expect(validator.errors().string).to.equal('str');
    expect(validator.errors().emptyString).to.equal('');
    expect(validator.errors().array).to.eql([1, 2, 3]);
    expect(validator.errors().emptyArray).to.eql([]);
    expect(validator.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(validator.errors().emptyObject).to.eql({});
    expect(validator.errors().null).to.be.null;
    expect(validator.errors().NaN).to.be.a.NaN;
    expect(validator.errors().fn).to.be.a('function');
    expect(validator.errors().undefined).to.be.undefined;
  });

  it('should accept only numbers if strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
    });

    validator.num('zero', 0)
             .num('int', 123)
             .num('float', 3.141592)
             .num('true', true)
             .num('trueString', 'true')
             .num('falseString', 'false')
             .num('trueInt', 1)
             .num('falseInt', 0)
             .num('trueIntString', '1')
             .num('falseIntString', '0')
             .num('false', false)
             .num('string', 'str')
             .num('emptyString', '')
             .num('array', [1, 2, 3])
             .num('emptyArray', [])
             .num('object', { a: 1, b: 2, c: 3 })
             .num('emptyObject', {})
             .num('null', null)
             .num('NaN', NaN)
             .num('fn', function() {})
             .num('undefined', undefined);

    expect(validator.valid().zero).to.equal(0);
    expect(validator.valid().int).to.equal(123);
    expect(validator.valid().float).to.equal(3.141592);
    expect(validator.errors().true).to.equal(true);
    expect(validator.errors().trueString).to.equal('true');
    expect(validator.errors().falseString).to.equal('false');
    expect(validator.valid().trueInt).to.equal(1);
    expect(validator.valid().falseInt).to.equal(0);
    expect(validator.errors().trueIntString).to.equal('1');
    expect(validator.errors().falseIntString).to.equal('0');
    expect(validator.errors().false).to.equal(false);
    expect(validator.errors().string).to.equal('str');
    expect(validator.errors().emptyString).to.equal('');
    expect(validator.errors().array).to.eql([1, 2, 3]);
    expect(validator.errors().emptyArray).to.eql([]);
    expect(validator.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(validator.errors().emptyObject).to.eql({});
    expect(validator.errors().null).to.be.null;
    expect(validator.errors().NaN).to.be.a.NaN;
    expect(validator.errors().fn).to.be.a('function');
    expect(validator.errors().undefined).to.be.undefined;
  });

  it('should convert float to integer if options.integer is true', function() {
    var validator = new Validator({ integer: true });

    validator.num('zero', 0)
             .num('int', 123)
             .num('float', 3.141592)
             .num('neg', -1.55);

    expect(validator.valid().zero).to.equal(0);
    expect(validator.valid().int).to.equal(123);
    expect(validator.valid().float).to.equal(3);
    expect(validator.valid().neg).to.equal(-1);
  });

  it('should clamp values if options.min/options.max are specified', function() {
    var validator = new Validator({ min: -5, max: 5 });

    validator.num('zero', 0)
             .num('posIn', 3)
             .num('posLimit', 5)
             .num('posOut', 10)
             .num('negIn', -3)
             .num('negOut', -10)
             .num('negLimit', -5);

    expect(validator.valid().zero).to.equal(0);
    expect(validator.valid().posIn).to.equal(3);
    expect(validator.valid().posOut).to.equal(5);
    expect(validator.valid().posLimit).to.equal(5);
    expect(validator.valid().negIn).to.equal(-3);
    expect(validator.valid().negOut).to.equal(-5);
    expect(validator.valid().negLimit).to.equal(-5);
  });

  it('should not validate numbers out of options.rangeMin/options.rangeMax', function() {
    var v1 = new Validator({
      returnNullOnErrors: false,
      rangeMin: -5,
      rangeMax: 5,
    });
    var v2 = new Validator({
      returnNullOnErrors: false,
      rangeMin: -5,
      rangeMax: 5,
      minEq: true,
      maxEq: true,
    });

    v1.num('zero', 0)
      .num('posIn', 3)
      .num('posLimit', 5)
      .num('posOut', 10)
      .num('negIn', -3)
      .num('negOut', -10)
      .num('negLimit', -5);

    expect(v1.valid().zero).to.equal(0);
    expect(v1.valid().posIn).to.equal(3);
    expect(v1.errors().posOut).to.equal(10);
    expect(v1.errors().posLimit).to.equal(5);
    expect(v1.valid().negIn).to.equal(-3);
    expect(v1.errors().negOut).to.equal(-10);
    expect(v1.errors().negLimit).to.equal(-5);

    v2.num('zero', 0)
      .num('posIn', 3)
      .num('posLimit', 5)
      .num('posOut', 10)
      .num('negIn', -3)
      .num('negOut', -10)
      .num('negLimit', -5);

    expect(v2.valid().zero).to.equal(0);
    expect(v2.valid().posIn).to.equal(3);
    expect(v2.errors().posOut).to.equal(10);
    expect(v2.valid().posLimit).to.equal(5);
    expect(v2.valid().negIn).to.equal(-3);
    expect(v2.errors().negOut).to.equal(-10);
    expect(v2.valid().negLimit).to.equal(-5);
  });

  it('should only accept data matching options.regExp if specified', function() {
    var validator = new Validator({
      returnNullOnErrors: false,
      regExp: /20[01]\d/,
    });

    validator.num('n1', 1900)
             .num('n2', 2000)
             .num('n3', 2005)
             .num('n4', 2010)
             .num('n5', 2015)
             .num('n6', 2020)
             .num('n7', 10.0, { regExp: '\\.0$' })
             .num('n8', '10.0', { regExp: '\\.0$' })
             .num('n9', 10.0, { regExp: '\\.0$', integer: true })
             .num('n10', '10.0', { regExp: '\\.0$', integer: true });

    expect(validator.errors().n1).to.equal(1900);
    expect(validator.valid().n2).to.equal(2000);
    expect(validator.valid().n3).to.equal(2005);
    expect(validator.valid().n4).to.equal(2010);
    expect(validator.valid().n5).to.equal(2015);
    expect(validator.errors().n6).to.equal(2020);
    expect(validator.errors().n7).to.equal(10.0);
    expect(validator.valid().n8).to.equal(10.0);
    expect(validator.errors().n9).to.equal(10);
    expect(validator.valid().n10).to.equal(10);
  });
});

describe('validator.str', function() {
  'use strict';

  it('should accept only strings when strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
    });

    validator.str('zero', 0)
             .str('int', 123)
             .str('float', 3.141592)
             .str('true', true)
             .str('trueString', 'true')
             .str('falseString', 'false')
             .str('trueInt', 1)
             .str('falseInt', 0)
             .str('trueIntString', '1')
             .str('falseIntString', '0')
             .str('false', false)
             .str('string', 'str')
             .str('emptyString', '')
             .str('array', [1, 2, 3])
             .str('emptyArray', [])
             .str('object', { a: 1, b: 2, c: 3 })
             .str('emptyObject', {})
             .str('null', null)
             .str('NaN', NaN)
             .str('fn', function() {})
             .str('undefined', undefined);

    expect(validator.valid().trueString).to.equal('true');
    expect(validator.valid().falseString).to.equal('false');
    expect(validator.valid().trueIntString).to.equal('1');
    expect(validator.valid().falseIntString).to.equal('0');
    expect(validator.valid().string).to.equal('str');
    expect(validator.valid().emptyString).to.equal('');

    expect(validator.errors().zero).to.equal(0);
    expect(validator.errors().int).to.equal(123);
    expect(validator.errors().float).to.equal(3.141592);
    expect(validator.errors().true).to.be.true;
    expect(validator.errors().trueInt).to.equal(1);
    expect(validator.errors().falseInt).to.equal(0);
    expect(validator.errors().false).to.be.false;
    expect(validator.errors().array).to.eql([1, 2, 3]);
    expect(validator.errors().emptyArray).to.eql([]);
    expect(validator.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(validator.errors().emptyObject).to.eql({});
    expect(validator.errors().null).to.equal(null);
    expect(validator.errors().NaN).to.be.a.NaN;
    expect(validator.errors().fn).to.be.a('function');
    expect(validator.errors().undefined).to.be.undefined;
  });

  it('should convert all data to string if strict is false', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });

    validator.str('zero', 0)
             .str('int', 123)
             .str('float', 3.141592)
             .str('true', true)
             .str('trueString', 'true')
             .str('falseString', 'false')
             .str('trueInt', 1)
             .str('falseInt', 0)
             .str('trueIntString', '1')
             .str('falseIntString', '0')
             .str('false', false)
             .str('string', 'str')
             .str('emptyString', '')
             .str('array', [1, 2, 3])
             .str('emptyArray', [])
             .str('object', { a: 1, b: 2, c: 3 })
             .str('emptyObject', {})
             .str('null', null)
             .str('NaN', NaN)
             .str('fn', function() {})
             .str('undefined', undefined);

    expect(validator.valid().zero).to.equal('0');
    expect(validator.valid().int).to.equal('123');
    expect(validator.valid().float).to.equal('3.141592');
    expect(validator.valid().true).to.equal('true');
    expect(validator.valid().trueString).to.equal('true');
    expect(validator.valid().falseString).to.equal('false');
    expect(validator.valid().trueInt).to.equal('1');
    expect(validator.valid().falseInt).to.equal('0');
    expect(validator.valid().trueIntString).to.equal('1');
    expect(validator.valid().falseIntString).to.equal('0');
    expect(validator.valid().false).to.equal('false');
    expect(validator.valid().string).to.equal('str');
    expect(validator.valid().emptyString).to.equal('');
    expect(validator.valid().array).to.equal('1,2,3');
    expect(validator.valid().emptyArray).to.equal('');
    expect(validator.valid().object).to.equal('[object Object]');
    expect(validator.valid().emptyObject).to.equal('[object Object]');
    expect(validator.valid().null).to.equal('null');
    expect(validator.valid().NaN).to.equal('NaN');
    expect(validator.valid().fn).to.equal('function () {}');
    expect(validator.valid().undefined).to.equal('undefined');
  });

  it('should not accept strings shorter than options.minLength if specified', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      minLength: 5,
    });

    validator.str('s0', '')
             .str('s0b', '', { minLength: 0 })
             .str('s3', 'abc')
             .str('s5', 'abcde')
             .str('s7', 'abcdegh')
             .str('s9', 'abcdeghij');

    expect(validator.errors().s0).equal('');
    expect(validator.valid().s0b).equal('');
    expect(validator.errors().s3).equal('abc');
    expect(validator.valid().s5).equal('abcde');
    expect(validator.valid().s7).equal('abcdegh');
    expect(validator.valid().s9).equal('abcdeghij');
  });

  it('should not accept strings larger than options.maxLength if specified', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      maxLength: 5,
    });

    validator.str('s0', '')
             .str('s3', 'abc')
             .str('s5', 'abcde')
             .str('s7', 'abcdegh')
             .str('s9', 'abcdeghij');

    expect(validator.valid().s0).equal('');
    expect(validator.valid().s3).equal('abc');
    expect(validator.valid().s5).equal('abcde');
    expect(validator.errors().s7).equal('abcdegh');
    expect(validator.errors().s9).equal('abcdeghij');
  });

  it('should accept strings larger than options.maxLength if specified,' +
     ' but truncate them', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
      maxLength: 5,
      truncate: true,
    });

    validator.str('s0', '')
             .str('s3', 'abc')
             .str('s5', 'abcde')
             .str('s7', 'abcdegh')
             .str('s9', 'abcdeghij', { append: '...' })
             .str('n', 0);

    expect(validator.valid().s0).equal('');
    expect(validator.valid().s3).equal('abc');
    expect(validator.valid().s5).equal('abcde');
    expect(validator.valid().s7).equal('abcde');
    expect(validator.valid().s9).equal('abcde...');

    expect(validator.errors().n).equal(0);
  });

  it('should accept only strings matching options.regExp if specified', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      regExp: '^[a-z_0-9]+$',
    });

    validator.str('s1', 'valid_string')
             .str('s2', 'valid_string_02')
             .str('s3', 'not valid string')
             .str('s4', 'NotValidEither');

    expect(validator.valid().s1).equal('valid_string');
    expect(validator.valid().s2).equal('valid_string_02');
    expect(validator.errors().s3).equal('not valid string');
    expect(validator.errors().s4).equal('NotValidEither');
  });

  it('should convert to lower case or upper case specified', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });

    validator.str('s1', 'camelCaseString', { upperCase: true })
             .str('s2', 'camelCaseString', { lowerCase: true })
             .str('s3', 'UPPER TO LOWER', { lowerCase: true })
             .str('s4', 'UPPER NOT CHANGED');

    expect(validator.valid().s1).to.equal('CAMELCASESTRING');
    expect(validator.valid().s2).to.equal('camelcasestring');
    expect(validator.valid().s3).to.equal('upper to lower');
    expect(validator.valid().s4).to.equal('UPPER NOT CHANGED');
  });
});

describe('validator.fn', function() {
  'use strict';

  it('should check if the data is a function or not, undependently of options.strict', function() {
    var v1 = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });
    var v2 = new Validator({
      strict: false,
      returnNullOnErrors: false,
    });

    v1.fn('zero', 0)
      .fn('int', 123)
      .fn('float', 3.141592)
      .fn('true', true)
      .fn('trueString', 'true')
      .fn('falseString', 'false')
      .fn('trueInt', 1)
      .fn('falseInt', 0)
      .fn('trueIntString', '1')
      .fn('falseIntString', '0')
      .fn('false', false)
      .fn('string', 'str')
      .fn('emptyString', '')
      .fn('array', [1, 2, 3])
      .fn('emptyArray', [])
      .fn('object', { a: 1, b: 2, c: 3 })
      .fn('emptyObject', {})
      .fn('null', null)
      .fn('NaN', NaN)
      .fn('fn', function() {})
      .fn('undefined', undefined);

    expect(v1.valid().fn).to.be.a('function');

    expect(v1.errors().zero).to.equal(0);
    expect(v1.errors().int).to.equal(123);
    expect(v1.errors().float).to.equal(3.141592);
    expect(v1.errors().true).to.equal(true);
    expect(v1.errors().trueString).to.equal('true');
    expect(v1.errors().falseString).to.equal('false');
    expect(v1.errors().trueInt).to.equal(1);
    expect(v1.errors().falseInt).to.equal(0);
    expect(v1.errors().trueIntString).to.equal('1');
    expect(v1.errors().falseIntString).to.equal('0');
    expect(v1.errors().false).to.equal(false);
    expect(v1.errors().string).to.equal('str');
    expect(v1.errors().emptyString).to.equal('');
    expect(v1.errors().array).to.eql([1, 2, 3]);
    expect(v1.errors().emptyArray).to.eql([]);
    expect(v1.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(v1.errors().emptyObject).to.eql({});
    expect(v1.errors().null).to.be.null;
    expect(v1.errors().NaN).to.be.a.NaN;
    expect(v1.errors().undefined).to.be.undefined;

    v2.fn('zero', 0)
      .fn('int', 123)
      .fn('float', 3.141592)
      .fn('true', true)
      .fn('trueString', 'true')
      .fn('falseString', 'false')
      .fn('trueInt', 1)
      .fn('falseInt', 0)
      .fn('trueIntString', '1')
      .fn('falseIntString', '0')
      .fn('false', false)
      .fn('string', 'str')
      .fn('emptyString', '')
      .fn('array', [1, 2, 3])
      .fn('emptyArray', [])
      .fn('object', { a: 1, b: 2, c: 3 })
      .fn('emptyObject', {})
      .fn('null', null)
      .fn('NaN', NaN)
      .fn('fn', function() {})
      .fn('undefined', undefined);

    expect(v2.valid().fn).to.be.a('function');

    expect(v2.errors().zero).to.equal(0);
    expect(v2.errors().int).to.equal(123);
    expect(v2.errors().float).to.equal(3.141592);
    expect(v2.errors().true).to.equal(true);
    expect(v2.errors().trueString).to.equal('true');
    expect(v2.errors().falseString).to.equal('false');
    expect(v2.errors().trueInt).to.equal(1);
    expect(v2.errors().falseInt).to.equal(0);
    expect(v2.errors().trueIntString).to.equal('1');
    expect(v2.errors().falseIntString).to.equal('0');
    expect(v2.errors().false).to.equal(false);
    expect(v2.errors().string).to.equal('str');
    expect(v2.errors().emptyString).to.equal('');
    expect(v2.errors().array).to.eql([1, 2, 3]);
    expect(v2.errors().emptyArray).to.eql([]);
    expect(v2.errors().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(v2.errors().emptyObject).to.eql({});
    expect(v2.errors().null).to.be.null;
    expect(v2.errors().NaN).to.be.a.NaN;
    expect(v2.errors().undefined).to.be.undefined;
  });
});

describe('validator.enumerated', function() {
  'use strict';

  var weekDays = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  it('should detect the data to be a value of an object', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumerated('e0', weekDays.MONDAY)
             .enumerated('e1', weekDays.TUESDAY)
             .enumerated('e2', weekDays.WEDNESDAY)
             .enumerated('e3', weekDays.THURSDAY)
             .enumerated('e4', 4)
             .enumerated('e5', weekDays.SATURDAY)
             .enumerated('e6', '6')
             .enumerated('n0', 'MONDAY')
             .enumerated('n1', 'other')
             .enumerated('n2', 10);

    expect(validator.valid().e0).to.equal(weekDays.MONDAY);
    expect(validator.valid().e1).to.equal(weekDays.TUESDAY);
    expect(validator.valid().e2).to.equal(weekDays.WEDNESDAY);
    expect(validator.valid().e3).to.equal(weekDays.THURSDAY);
    expect(validator.valid().e4).to.equal(4);
    expect(validator.valid().e5).to.equal(weekDays.SATURDAY);
    expect(validator.valid().e6).to.equal(weekDays.SUNDAY);
    expect(validator.errors().n0).to.equal('MONDAY');
    expect(validator.errors().n1).to.equal('other');
    expect(validator.errors().n2).to.equal(10);
  });

  it('should compare strictly when option.strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumerated('e0', weekDays.MONDAY)
            .enumerated('e1', weekDays.TUESDAY)
            .enumerated('e2', weekDays.WEDNESDAY)
            .enumerated('e3', weekDays.THURSDAY)
            .enumerated('e4', 4)
            .enumerated('e5', weekDays.SATURDAY)
            .enumerated('e6', '6')
            .enumerated('n0', 'MONDAY')
            .enumerated('n1', 'other')
            .enumerated('n2', 10);

    expect(validator.valid().e0).to.equal(weekDays.MONDAY);
    expect(validator.valid().e1).to.equal(weekDays.TUESDAY);
    expect(validator.valid().e2).to.equal(weekDays.WEDNESDAY);
    expect(validator.valid().e3).to.equal(weekDays.THURSDAY);
    expect(validator.valid().e4).to.equal(4);
    expect(validator.valid().e5).to.equal(weekDays.SATURDAY);
    expect(validator.errors().e6).to.equal('6');
    expect(validator.errors().n0).to.equal('MONDAY');
    expect(validator.errors().n1).to.equal('other');
    expect(validator.errors().n2).to.equal(10);
  });
});

describe('validator.enumeratedKey', function() {
  'use strict';

  var weekDays = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
    123: 'Key as number',
  };

  it('should detect the data to be a key of an object', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumeratedKey('e0', 'MONDAY')
             .enumeratedKey('e1', 123)
             .enumeratedKey('e2', '123')
             .enumeratedKey('n0', 1)
             .enumeratedKey('n1', weekDays.TUESDAY);

    expect(validator.valid().e0).to.equal('MONDAY');
    expect(validator.valid().e1).to.equal('123');
    expect(validator.valid().e2).to.equal('123');
    expect(validator.errors().n0).to.equal(1);
    expect(validator.errors().n1).to.equal(weekDays.TUESDAY);
  });

  it('should compare strictly when option.strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumeratedKey('e0', 'MONDAY')
             .enumeratedKey('e1', 123)
             .enumeratedKey('e2', '123')
             .enumeratedKey('n0', 1)
             .enumeratedKey('n1', weekDays.TUESDAY);

    expect(validator.valid().e0).to.equal('MONDAY');
    expect(validator.errors().e1).to.equal(123);
    expect(validator.valid().e2).to.equal('123');
    expect(validator.errors().n0).to.equal(1);
    expect(validator.errors().n1).to.equal(weekDays.TUESDAY);
  });
});

describe('validator.enumeratedKeyValue', function() {
  'use strict';

  var weekDays = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
    123: 'Key as number',
  };

  it('should detect the data to be a key of an object,' +
     ' and return it\'s associated value', function() {
    var validator = new Validator({
      strict: false,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumeratedKeyValue('e0', 'MONDAY')
             .enumeratedKeyValue('e1', 123)
             .enumeratedKeyValue('e2', '123')
             .enumeratedKeyValue('n0', 1)
             .enumeratedKeyValue('n1', weekDays.TUESDAY);

    expect(validator.valid().e0).to.equal(0);
    expect(validator.valid().e1).to.equal('Key as number');
    expect(validator.valid().e2).to.equal('Key as number');
    expect(validator.errors().n0).to.equal(1);
    expect(validator.errors().n1).to.equal(weekDays.TUESDAY);
  });

  it('should compare strictly when option.strict is true', function() {
    var validator = new Validator({
      strict: true,
      returnNullOnErrors: false,
      enumerated: weekDays,
    });

    validator.enumeratedKeyValue('e0', 'MONDAY')
             .enumeratedKeyValue('e1', 123)
             .enumeratedKeyValue('e2', '123')
             .enumeratedKeyValue('n0', 1)
             .enumeratedKeyValue('n1', weekDays.TUESDAY);

    expect(validator.valid().e0).to.equal(0);
    expect(validator.errors().e1).to.equal(123);
    expect(validator.valid().e2).to.equal('Key as number');
    expect(validator.errors().n0).to.equal(1);
    expect(validator.errors().n1).to.equal(weekDays.TUESDAY);
  });
});

describe('validator.json', function() {
  'use strict';

  it('should validate json and return it\'s parsed data without using' +
     ' options.strict', function() {
    var v1 = new Validator({
      strict: true,
      returnNullOnErrors: false,
    });
    var v2 = new Validator({
      strict: true,
      returnNullOnErrors: false,
    });

    v1.json('zero', '0')
      .json('int', '123')
      .json('float', '3.141592')
      .json('true', 'true')
      .json('trueString', '"true"')
      .json('falseString', '"false"')
      .json('trueInt', '1')
      .json('falseInt', '0')
      .json('trueIntString', '"1"')
      .json('falseIntString', '"0"')
      .json('false', 'false')
      .json('string', '"str"')
      .json('emptyString', '""')
      .json('array', '[1, 2, 3]')
      .json('emptyArray', '[]')
      .json('object', '{ "a": 1, "b": 2, "c": 3 }')
      .json('emptyObject', '{}')
      .json('null', 'null')
      .json('NaN', 'NaN')
      .json('fn', 'function() {}')
      .json('undefined', 'undefined');

    expect(v1.valid().zero).to.equal(0);
    expect(v1.valid().int).to.equal(123);
    expect(v1.valid().float).to.equal(3.141592);
    expect(v1.valid().true).to.equal(true);
    expect(v1.valid().trueString).to.equal('true');
    expect(v1.valid().falseString).to.equal('false');
    expect(v1.valid().trueInt).to.equal(1);
    expect(v1.valid().falseInt).to.equal(0);
    expect(v1.valid().trueIntString).to.equal('1');
    expect(v1.valid().falseIntString).to.equal('0');
    expect(v1.valid().false).to.equal(false);
    expect(v1.valid().string).to.equal('str');
    expect(v1.valid().emptyString).to.equal('');
    expect(v1.valid().array).to.eql([1, 2, 3]);
    expect(v1.valid().emptyArray).to.eql([]);
    expect(v1.valid().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(v1.valid().emptyObject).to.eql({});
    expect(v1.valid().null).to.be.null;
    expect(v1.valid().undefined).to.be.undefined;

    expect(v1.errors().NaN).to.be.defined;
    expect(v1.errors().fn).to.be.defined;

    v2.json('zero', '0')
      .json('int', '123')
      .json('float', '3.141592')
      .json('true', 'true')
      .json('trueString', '"true"')
      .json('falseString', '"false"')
      .json('trueInt', '1')
      .json('falseInt', '0')
      .json('trueIntString', '"1"')
      .json('falseIntString', '"0"')
      .json('false', 'false')
      .json('string', '"str"')
      .json('emptyString', '""')
      .json('array', '[1, 2, 3]')
      .json('emptyArray', '[]')
      .json('object', '{ "a": 1, "b": 2, "c": 3 }')
      .json('emptyObject', '{}')
      .json('null', 'null')
      .json('NaN', 'NaN')
      .json('fn', 'function() {}')
      .json('undefined', 'undefined');

    expect(v2.valid().zero).to.equal(0);
    expect(v2.valid().int).to.equal(123);
    expect(v2.valid().float).to.equal(3.141592);
    expect(v2.valid().true).to.equal(true);
    expect(v2.valid().trueString).to.equal('true');
    expect(v2.valid().falseString).to.equal('false');
    expect(v2.valid().trueInt).to.equal(1);
    expect(v2.valid().falseInt).to.equal(0);
    expect(v2.valid().trueIntString).to.equal('1');
    expect(v2.valid().falseIntString).to.equal('0');
    expect(v2.valid().false).to.equal(false);
    expect(v2.valid().string).to.equal('str');
    expect(v2.valid().emptyString).to.equal('');
    expect(v2.valid().array).to.eql([1, 2, 3]);
    expect(v2.valid().emptyArray).to.eql([]);
    expect(v2.valid().object).to.eql({ a: 1, b: 2, c: 3 });
    expect(v2.valid().emptyObject).to.eql({});
    expect(v2.valid().null).to.be.null;
    expect(v2.valid().undefined).to.be.undefined;

    expect(v2.errors().NaN).to.be.defined;
    expect(v2.errors().fn).to.be.defined;
  });
});

