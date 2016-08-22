var expect = require('chai').expect;
var Validator = require('../index').Validator;

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

  it('should not allow overwriting a validator' +
     ' if options.allowOverwriteValidator is false', function() {
    var validator = new Validator({ allowOverwriteValidator: true });

    expect(validator.num).not.to.be.undefined;
    validator.num('zero', 0);
    expect(validator.errors()).to.be.null;
    validator.reset();

    validator.addValidator('num', idValidatorDefinition);
    validator.num('zero', 0);
    expect(validator.errors()).not.to.be.null;
  });

  it('should allow overwriting a validator' +
     ' if options.allowOverwriteValidator is false', function() {
    var validator = new Validator({ allowOverwriteValidator: false });

    expect(validator.num).not.to.be.undefined;
    expect(function() {
      validator.addValidator('num', idValidatorDefinition);
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

  it('should not allow defining aliases if there is already a method with that name', function() {
    var v1 = new Validator({ returnNullOnErrors: false });

    expect(function() {
      Validator.addAlias('str', 'num', {});
    }).to.throw(Error);

    expect(function() {
      v1.addAlias('str', 'num', {});
    }).to.throw(Error);
  });
});
