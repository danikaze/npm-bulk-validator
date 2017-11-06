var expect = require('chai').expect;
var Validator = require('../src/index').Validator;

describe('basic definitions of the aliases', function() {
  'use strict';
  var validator = new Validator();

  it('should have basic aliases by default', function() {
    expect(validator.notEmptyStr).to.be.a('function');
  });

  it('should have basic array aliases by default', function() {
    expect(validator.notEmptyStrArray).to.be.a('function');
  });

  it('should have basic object aliases by default', function() {
    expect(validator.notEmptyStrObject).to.be.a('function');
  });
});

describe('alias.notEmptyStr', function() {
  'use strict';

  it('should not accept empty strings', function() {
    var validator = new Validator({ returnNullOnErrors: false });

    validator.notEmptyStr('s1', 'abcd')
             .notEmptyStr('s2', ' ')
             .notEmptyStr('s3', '')
             .notEmptyStr('n1', 2);

    expect(validator.valid().s1).to.be.equal('abcd');
    expect(validator.valid().s2).to.be.equal(' ');
    expect(validator.errors().s3).to.be.equal('');
    expect(validator.valid().n1).to.be.equal('2');
  });
});

describe('alias.positiveInt', function() {
  'use strict';

  it('should accept only numbers > 0 as integer', function() {
    var validator = new Validator({ returnNullOnErrors: false });

    validator.positiveInt('n1', '123')
             .positiveInt('n2', 123)
             .positiveInt('n3', 1)
             .positiveInt('n4', 1215752191)
             .positiveInt('n5', 0)
             .positiveInt('n6', -1)
             .positiveInt('n7', -1215752190)
             .positiveInt('f1', 1.5)
             .positiveInt('f2', '6.5')
             .positiveInt('f3', 0.5)
             .positiveInt('f4', 0.0)
             .positiveInt('f5', -1.5)
             .positiveInt('f6', -0.5)
             .positiveInt('f7', -1000.1);

    expect(validator.valid().n1).to.be.equal(123);
    expect(validator.valid().n2).to.be.equal(123);
    expect(validator.valid().n3).to.be.equal(1);
    expect(validator.valid().n4).to.be.equal(1215752191);
    expect(validator.errors().n5).to.be.equal(0);
    expect(validator.errors().n6).to.be.equal(-1);
    expect(validator.errors().n7).to.be.equal(-1215752190);
    expect(validator.valid().f1).to.be.equal(1);
    expect(validator.valid().f2).to.be.equal(6);
    expect(validator.errors().f3).to.be.equal(0.5);
    expect(validator.errors().f4).to.be.equal(0.0);
    expect(validator.errors().f5).to.be.equal(-1.5);
    expect(validator.errors().f6).to.be.equal(-0.5);
    expect(validator.errors().f7).to.be.equal(-1000.1);
  });
});
