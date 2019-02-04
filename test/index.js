var expect = require('chai').expect;
var isArray = require('vanilla-type-check/isArray').isArray;
var isObject = require('vanilla-type-check/isObject').isObject;
var Validator = require('../src/index').Validator;

var basicValidator = new Validator({ returnNullOnErrors: false });

/*
 * Define an alias options which accept only strings containing vowels and spaces
 * returning an uppercased string with 15 as max-length
 */
var aliasDefinition = {
  alias: 'aliasEx',
  validator: 'str',
  options: {
    maxLength: 15,
    truncate: true,
    regExp: /^[aeiou AEIOU]*$/,
    upperCase: true,
  },
};

/*
 * Define a schema to use in `addSchema` tests
 */
var schemaDefinition = {
  name: 's1',
  schema: {
    foo: {
      validator: 'str',
    },
    bar: {
      validator: 'num',
      options: { optional: true, defaultValue: 0 },
    },
  },
  options: {},
};

var schemaDefinition2 = {
  name: 's2',
  schema: {
    foo: {
      validator: 'str',
    },
    bar: {
      validator: 'num',
      options: { optional: true, defaultValue: 1 },
    },
  },
  options: {},
};

/*
 * Define a validator for IDs, which should be integers > 0
 */
function idValidatorDefinition(data, options) {
  'use strict';

  basicValidator.reset();
  basicValidator.num('num', data, {
    integer: true,
    rangeMin: 1,
    minEq: true,
  });

  return {
    data: basicValidator.valid().num,
    valid: basicValidator.errors() === null,
  };
}

describe('validator basic', function() {
  'use strict';

  /*
   * tests
   */
  it('should have basic objects defined', function() {
    var validator = new Validator();

    expect(Validator).to.be.a('function');
    expect(Validator.addValidator).to.be.a('function');
    expect(Validator.addAlias).to.be.a('function');
    expect(Validator.defaultOptions).to.be.an('object');

    expect(validator).to.be.an.instanceof(Validator);
    expect(validator.valid).to.be.a('function');
    expect(validator.errors).to.be.a('function');
    expect(validator.reset).to.be.a('function');
    expect(validator.resetValid).to.be.a('function');
    expect(validator.resetErrors).to.be.a('function');
    expect(validator.addValidator).to.be.a('function');
    expect(validator.addAlias).to.be.a('function');
  });

  it('should allow adding local definitions', function() {
    var v1 = new Validator();
    var v2 = new Validator();

    expect(v1.addValidator('id', idValidatorDefinition)).to.be.equal(v1);
    expect(v1.id).to.be.a('function');
    expect(v1.idArray).to.be.a('function');
    expect(v1.idObject).to.be.a('function');
    expect(v2.id).to.be.undefined;
    expect(v2.idArray).to.be.undefined;
    expect(v2.idObject).to.be.undefined;
  });

  it('should allow adding global definitions', function() {
    var v1 = new Validator();
    var v2 = new Validator();

    Validator.addValidator('id', idValidatorDefinition);
    expect(v1.id).to.be.a('function');
    expect(v1.idArray).to.be.a('function');
    expect(v1.idObject).to.be.a('function');
    expect(v2.id).to.be.equal(v1.id);
    expect(v2.idArray).to.be.equal(v1.idArray);
    expect(v2.idObject).to.be.equal(v1.idObject);
  });

  it('should add array validators', function() {
    var validator = new Validator();

    validator.idArray('idList', [1, 2, 3, 4]);
    expect(validator.valid()).not.to.be.null;
    expect(validator.valid().idList).to.be.an('array');
    expect(validator.errors()).to.be.null;
  });

  it('should add object validators', function() {
    var validator = new Validator();

    validator.idObject('idSet', { a: 1, b: 2, c: 3 });
    expect(validator.valid()).not.to.be.null;
    expect(validator.valid().idSet).to.be.an('object');
    expect(validator.errors()).to.be.null;
  });

  it('should reset valid data when calling resetValid()', function() {
    var validator = new Validator();

    validator.str('data1', 'str')
             .str('data2', 'str');

    expect(validator.valid()).not.to.be.null;
    expect(validator.valid()).not.to.be.empty;
    expect(validator.resetValid()).to.equal(validator);
    expect(validator.valid()).to.be.empty;
  });

  it('should reset errors when calling resetErrors()', function() {
    var validator = new Validator();

    validator.num('data1', 123)
             .num('data2', 'str');

    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.resetErrors()).to.equal(validator);
    expect(validator.errors()).to.be.null;
  });

  it('should reset errors and valid data when calling reset()', function() {
    var validator = new Validator({ returnNullOnErrors: false });

    validator.str('data1', 'str')
             .num('data2', 'str');

    expect(validator.valid()).not.to.be.null;
    expect(validator.valid()).not.to.be.empty;
    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.reset()).to.equal(validator);
    expect(validator.valid()).to.be.empty;
    expect(validator.errors()).to.be.null;
  });
});

describe('validator basic options', function() {
  'use strict';

  it('should return canonized data if options.canonize is true', function() {
    var validator = new Validator({ canonized: true });

    validator.num('data1', 123)
             .num('data2', '456');

    expect(validator.valid().data1).to.equal(123);
    expect(validator.valid().data2).to.equal(456);
    expect(validator.valid().data2).not.to.equal('456');
  });

  it('should return the original data if options.canonize is false', function() {
    var validator = new Validator({ canonize: false });

    validator.num('data1', 123)
             .num('data2', '456');

    expect(validator.valid().data1).to.equal(123);
    expect(validator.valid().data2).not.to.equal(456);
    expect(validator.valid().data2).to.equal('456');
  });

  it('should return null when calling valid() if there\'s any error' +
     ' if options.returnNullOnErrors is true', function() {
    var validator = new Validator({ returnNullOnErrors: true });

    validator.num('data1', 123)
             .num('data2', 'str');

    expect(validator.valid()).to.be.null;
    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.errors().data2).to.equal('str');
  });

  it('should return valid values when calling valid() if there\'s any error' +
     ' if options.returnNullOnErrors is false', function() {
    var validator = new Validator({ returnNullOnErrors: false });

    validator.num('data1', 123)
             .num('data2', 'str');

    expect(validator.valid()).not.to.be.null;
    expect(validator.valid()).not.to.be.empty;
    expect(validator.valid().data1).to.equal(123);
    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.errors().data2).to.equal('str');
  });

  it('should return only one error if options.stopAfterFirstError is true', function() {
    var validator = new Validator({ stopAfterFirstError: true });

    validator.num('data1', 123)
             .num('data2', 'foo')
             .num('data3', 'bar');

    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.errors().data2).to.equal('foo');
    expect(validator.errors().data3).to.be.undefined;
  });

  it('should return all the errors if options.stopAfterFirstError is false', function() {
    var validator = new Validator({ stopAfterFirstError: false });

    validator.num('data1', 123)
             .num('data2', 'foo')
             .num('data3', 'bar');

    expect(validator.errors()).not.to.be.null;
    expect(validator.errors()).not.to.be.empty;
    expect(validator.errors().data2).to.equal('foo');
    expect(validator.errors().data3).to.equal('bar');
  });

  it('should allow overwriting a validator' +
     ' if options.allowOverwriteValidator is true', function() {
    var validator = new Validator({ allowOverwriteValidator: true });

    expect(validator.num).not.to.be.undefined;
    validator.num('zero', 0);
    expect(validator.errors()).to.be.null;
    validator.reset();

    expect(function() {
      validator.addValidator('num', idValidatorDefinition);
    }).to.not.throw(Error);
    validator.num('zero', 0);
    expect(validator.errors()).not.to.be.null;
  });

  it('should not allow overwriting a validator' +
     ' if options.allowOverwriteValidator is false', function() {
    var validator = new Validator({ allowOverwriteValidator: false });

    expect(validator.num).not.to.be.undefined;
    expect(function() {
      validator.addValidator('num', idValidatorDefinition);
    }).to.throw(Error);
  });

  it('should allow overwriting an alias' +
     ' if options.allowOverwriteValidator is true', function() {
    var validator = new Validator({ allowOverwriteValidator: true });

    expect(validator.notEmptyStr).not.to.be.undefined;
    validator.notEmptyStr('str', 'xxx');
    expect(validator.errors()).to.be.null;
    validator.reset();

    expect(function() {
      validator.addAlias('notEmptyStr', aliasDefinition.validator, aliasDefinition.options);
    }).to.not.throw(Error);
    validator.notEmptyStr('str', 'xxx');
    expect(validator.errors()).not.to.be.null;
  });

  it('should not allow overwriting an alias' +
     ' if options.allowOverwriteValidator is false', function() {
    var validator = new Validator({ allowOverwriteValidator: false });

    expect(validator.notEmptyStr).not.to.be.undefined;
    expect(function() {
      validator.addAlias('notEmptyStr', aliasDefinition.validator, aliasDefinition.options);
    }).to.throw(Error);
  });

  it('should allow overwriting a schema' +
     ' if options.allowOverwriteValidator is true', function() {
    var validator = new Validator({ allowOverwriteValidator: true });
    var data = { foo: 'xxx' };

    validator.addSchema(schemaDefinition.name, schemaDefinition.schema, schemaDefinition.options);
    validator.schema(schemaDefinition.name, data);
    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({ foo: 'xxx', bar: 0 });
    validator.reset();

    expect(function() {
      validator.addSchema(schemaDefinition.name,
                          schemaDefinition2.schema,
                          schemaDefinition2.options);
    }).to.not.throw(Error);
    validator.schema(schemaDefinition.name, data);
    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({ foo: 'xxx', bar: 1 });
  });

  it('should not allow overwriting a schema' +
     ' if options.allowOverwriteValidator is false', function() {
    var validator = new Validator({ allowOverwriteValidator: false });

    validator.addSchema(schemaDefinition.name, schemaDefinition, schemaDefinition.options);
    expect(function() {
      validator.addSchema(schemaDefinition.name,
                          schemaDefinition2.schema,
                          schemaDefinition2.options);
    }).to.throw(Error);
  });

  it('should return options.defaultValue if specified and options.optional is true', function() {
    var validator = new Validator({ optional: true, defaultValue: -1 });

    validator.num('data1', 123)
             .num('data2', undefined)
             .num('data3', undefined, { defaultValue: 0 });

    expect(validator.errors()).to.be.null;
    expect(validator.valid().data1).to.equal(123);
    expect(validator.valid().data2).to.equal(-1);
    expect(validator.valid().data3).to.equal(0);
  });

  it('should add options.validators as local definitions if specified', function() {
    var validator = new Validator({
      returnNullOnErrors: false,
      validators: {
        idValidator: idValidatorDefinition,
      },
    });

    expect(validator.idValidator).to.be.a('function');

    validator.idValidator('pass', 123)
             .idValidator('fail', 0);

    expect(validator.valid().pass).to.equal(123);
    expect(validator.errors().fail).to.equal(0);
  });

  it('shouldn\'t return undefined values', function() {
    var validator = new Validator({ optional: true, returnUndefined: false });

    validator.num('data1', 123)
             .num('data2', undefined)
             .num('data3', undefined, { defaultValue: 0 });

    expect(validator.errors()).to.be.null;
    expect(validator.valid().data1).to.equal(123);
    expect(validator.valid().data2).to.be.undefined;
    expect(validator.valid().data3).to.equal(0);
    expect(Object.keys(validator.valid())).to.include('data1');
    expect(Object.keys(validator.valid())).to.include('data3');
    expect(Object.keys(validator.valid())).to.not.include('data2');
  });
});

describe('validator transform functions', function() {
  'use strict';

  function toInt(data) {
    return parseInt(data, 10);
  }

  function splitToArray(data) {
    return data.split(',').map(function (item) { return item.trim(); });
  }

  function splitToObject(data) {
    var c = 'a'.charCodeAt(0);
    var res = {};

    splitToArray(data).forEach((item) => {
      res[String.fromCharCode(c++)] = item;
    });

    return res;
  }

  function prefixer(str) {
    return function(data) {
      return str + data;
    };
  }

  function postfixer(str) {
    return function(data) {
      return data + str;
    };
  }

  function join(data) {
    var res;

    if (isArray(data)) {
      res = data.join(', ');
    } else if (isObject(data)) {
      res = Object.keys(data)
        .map(function (key) { return data[key]; })
        .join(', ');
    } else {
      res = data;
    }
    return '{' + res + '}';
  }

  function triggerError() {
    throw new Error();
  }

  it('should pre-transform the raw data', function() {
    var validator = new Validator({
      canonize: false,
    });

    validator.num('single', '123', { preTransform: toInt });
    validator.numArray('array', '1,2,3', { preTransform: splitToArray });
    validator.numObject('object', '1,2,3', { preTransform: splitToObject });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: 123,
      array: ['1', '2', '3'],
      object: { a: '1', b: '2', c: '3' },
    });
  });

  it('should pre-transform each data item', function() {
    var validator = new Validator({
      strict: true,
      preTransformItem: toInt,
    });

    validator.num('single', '123');
    validator.numArray('array', ['1', '2', '3']);
    validator.numObject('object', { a: '1', b: '2', c: '3' });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: 123,
      array: [1, 2, 3],
      object: { a: 1, b: 2, c: 3 },
    });
  });

  it('should pre-transform the raw data and then each data item', function() {
    var validator = new Validator({
      preTransformItem: prefixer('('),
    });

    validator.str('single', 'abc');
    validator.strArray('array', '1,2,3', { preTransform: splitToArray });
    validator.strObject('object', '1,2,3', { preTransform: splitToObject });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: '(abc',
      array: ['(1', '(2', '(3'],
      object: { a: '(1', b: '(2', c: '(3' },
    });
  });

  it('should post-transform the raw data', function() {
    var validator = new Validator({
      strict: true,
      postTransform: join,
    });

    validator.num('single', 123);
    validator.numArray('array', [1, 2, 3]);
    validator.numObject('object', { a: 1, b: 2, c: 3 });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: '{123}',
      array: '{1, 2, 3}',
      object: '{1, 2, 3}',
    });
  });

  it('should post-transform each data item', function() {
    var validator = new Validator({
      strict: true,
      postTransformItem: prefixer('('),
    });

    validator.num('single', 123);
    validator.numArray('array', [1, 2, 3]);
    validator.numObject('object', { a: 1, b: 2, c: 3 });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: '(123',
      array: ['(1', '(2', '(3'],
      object: { a: '(1', b: '(2', c: '(3' },
    });
  });

  it('should post-transform each data item and then the resulting data', function() {
    var validator = new Validator({
      strict: true,
      postTransformItem: prefixer('('),
      postTransform: join,
    });

    validator.num('single', 123);
    validator.numArray('array', [1, 2, 3]);
    validator.numObject('object', { a: 1, b: 2, c: 3 });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: '{(123}',
      array: '{(1, (2, (3}',
      object: '{(1, (2, (3}',
    });
  });

  it('should combine pre and post transforms', function() {
    var validator = new Validator({
      strict: true,
      preTransformItem: toInt,
      postTransformItem: prefixer('('),
      postTransform: join,
    });

    validator.num('single', '123');
    validator.numArray('array', '1,2,3', { preTransform: splitToArray });
    validator.numObject('object', '1,2,3', { preTransform: splitToObject });

    expect(validator.errors()).to.be.null;
    expect(validator.valid()).to.eql({
      single: '{(123}',
      array: '{(1, (2, (3}',
      object: '{(1, (2, (3}',
    });
  });

  it('should not validate nor trigger error when transform fails', function() {
    var validator = new Validator();

    validator.num('ok', 123);
    expect(function() {
      validator.num('d1', 1, { preTransform: triggerError });
    }).to.not.throw(Error);
    expect(function() {
      validator.num('d2', 2, { preTransformItem: triggerError });
    }).to.not.throw(Error);
    expect(function() {
      validator.num('d3', 3, { postTransform: triggerError });
    }).to.not.throw(Error);
    expect(function() {
      validator.num('d4', 4, { postTransformItem: triggerError });
    }).to.not.throw(Error);

    expect(validator.valid()).to.eql({ ok: 123 });
    expect(validator.errors()).to.eql({
      d1: 1,
      d2: 2,
      d3: 3,
      d4: 4,
    });
  });

  it('should apply multiple transformation functions', function() {
    var validator = new Validator();
    var pre = [prefixer('['), prefixer('{')];
    var preItem = [prefixer('<'), prefixer('~')];
    var post = [postfixer('}'), postfixer(']')];
    var postItem = [postfixer('+'), postfixer('>')];

    validator.str('pre', 'abc', { preTransform: pre });
    validator.strArray('preArray', ['a', 'b'], { preTransformItem: preItem });
    validator.strObject('preObject', { a: 'a', b: 'b' }, { preTransformItem: preItem });
    validator.str('post', 'abc', { preTransform: post });
    validator.strArray('postArray', ['a', 'b'], { preTransformItem: postItem });
    validator.strObject('postObject', { a: 'a', b: 'b' }, { postTransformItem: postItem });

    expect(validator.valid()).to.eql({
      pre: '{[abc',
      preArray: ['~<a', '~<b'],
      preObject: { a: '~<a', b: '~<b' },
      post: 'abc}]',
      postArray: ['a+>', 'b+>'],
      postObject: { a: 'a+>', b: 'b+>' },
    });
  });
});

describe('validator aliases basic', function() {
  'use strict';

  it('should allow adding local aliases', function() {
    var v1 = new Validator();
    var v2 = new Validator();

    expect(v1.addAlias(aliasDefinition.alias,
                       aliasDefinition.validator,
                       aliasDefinition.options)).to.be.equal(v1);
    expect(v1[aliasDefinition.alias]).to.be.a('function');
    expect(v1[aliasDefinition.alias + 'Array']).to.be.a('function');
    expect(v1[aliasDefinition.alias + 'Object']).to.be.a('function');
    expect(v2[aliasDefinition.alias]).to.be.undefined;
    expect(v2[aliasDefinition.alias + 'Array']).to.be.undefined;
    expect(v2[aliasDefinition.alias + 'Object']).to.be.undefined;
  });

  it('should allow adding global aliases', function() {
    var v1 = new Validator({ returnNullOnErrors: false });
    var v2 = new Validator();

    Validator.addAlias(aliasDefinition.alias,
                       aliasDefinition.validator,
                       aliasDefinition.options);
    expect(v1[aliasDefinition.alias]).to.be.a('function');
    expect(v1[aliasDefinition.alias + 'Array']).to.be.a('function');
    expect(v1[aliasDefinition.alias + 'Object']).to.be.a('function');
    expect(v2[aliasDefinition.alias]).to.be.equal(v1[aliasDefinition.alias]);
    expect(v2[aliasDefinition.alias + 'Array']).to.be.equal(v1[aliasDefinition.alias + 'Array']);
    expect(v2[aliasDefinition.alias + 'Object']).to.be.equal(v1[aliasDefinition.alias + 'Object']);

    v1.v1 = true;
    v1[aliasDefinition.alias]('a1', 'aeiou');
    v1[aliasDefinition.alias]('a2', 'aeiou AEIOU');
    v1[aliasDefinition.alias]('a3', 'aeiou aeiou aeiou aeiou aeiou');
    v1[aliasDefinition.alias]('a4', 'abcdef');

    expect(v1.valid().a1).to.equal('AEIOU');
    expect(v1.valid().a2).to.equal('AEIOU AEIOU');
    expect(v1.valid().a3).to.equal('AEIOU AEIOU AEI');
    expect(v1.errors().a4).to.equal('abcdef');
  });
});

describe('validator schemas basic', function() {
  'use strict';

  it('should allow adding new schemas', function() {
    var v1 = new Validator();
    var v2 = new Validator();
    var data = {
      foo: 'foo',
      bar: 123,
    };

    expect(v1.addSchema(schemaDefinition.name,
                        schemaDefinition.schema,
                        schemaDefinition.options)).to.be.equal(v1);
    expect(v1.schema).to.be.a('function');

    expect(function() { v1.schema(schemaDefinition.name, data); }).to.not.throw();
    expect(function() { v2.schema(schemaDefinition.name, data); }).to.throw();
  });

  it('should allow adding global schemas', function() {
    var v1 = new Validator({ returnNullOnErrors: false });
    var v2 = new Validator({ returnNullOnErrors: false });
    var data = {
      foo: 'foo',
      bar: 123,
    };

    Validator.addSchema(schemaDefinition.name,
                        schemaDefinition.schema,
                        schemaDefinition.options);
    expect(function() { v1.schema(schemaDefinition.name, data); }).to.not.throw();
    expect(function() { v2.schema(schemaDefinition.name, data); }).to.not.throw();

    expect(v1.schema(schemaDefinition.name, data).valid()).to.eql(data);
    expect(v2.schema(schemaDefinition.name, data).valid()).to.eql(data);
  });
});

describe('default options', function() {
  'use strict';

  var v1;
  var v2;
  var schema = {
    num: {
      validator: 'num',
    },
    str: {
      validator: 'positiveInt',
    },
  };
  var schemaName = 'schemaDefaultTest';

  it('should apply default options in a validator if not specified', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.num('num', 1);
    v1.num('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v2 = new Validator();
    v2.num('num', 1);
    v2.num('str', '1');
    expect(v2.valid().num).to.equal(1);
    expect(v2.valid().str).to.equal('1');
  });

  it('should apply latest default options in a validator even if they are updated', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.num('num', 1);
    v1.num('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v1.num('num', 1);
    v1.num('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal('1');
  });

  it('should apply default options in an alias if not specified', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.positiveInt('num', 1);
    v1.positiveInt('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v2 = new Validator();
    v2.positiveInt('num', 1);
    v2.positiveInt('str', '1');
    expect(v2.valid().num).to.equal(1);
    expect(v2.valid().str).to.equal('1');
  });

  it('should apply latest default options in an alias even if they are updated', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.positiveInt('num', 1);
    v1.positiveInt('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v1.positiveInt('num', 1);
    v1.positiveInt('str', '1');
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal('1');
  });

  it('should apply default options in a schema if not specified', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.addSchema(schemaName, schema);
    v1.schema(schemaName, {
      num: 1,
      str: '1',
    });
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v2 = new Validator();
    v2.addSchema(schemaName, schema);
    v2.schema(schemaName, {
      num: 1,
      str: '1',
    });
    expect(v2.valid().num).to.equal(1);
    expect(v2.valid().str).to.equal('1');
  });

  it('should apply latest default options in a schema even if they are updated', function() {
    Validator.defaultOptions.strict = false;
    Validator.defaultOptions.canonize = true;

    v1 = new Validator();
    v1.addSchema(schemaName, schema);
    v1.schema(schemaName, {
      num: 1,
      str: '1',
    });
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal(1);

    Validator.defaultOptions.canonize = false;

    v1.schema(schemaName, {
      num: 1,
      str: '1',
    });
    expect(v1.valid().num).to.equal(1);
    expect(v1.valid().str).to.equal('1');
  });
});
