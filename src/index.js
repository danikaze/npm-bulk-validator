var extend = require('extend');
var isArray = require('vanilla-type-check/isArray').isArray;
var isEmpty = require('vanilla-type-check/isEmpty').isEmpty;
var isFunction = require('vanilla-type-check/isFunction').isFunction;
var isObject = require('vanilla-type-check/isObject').isObject;
var isString = require('vanilla-type-check/isString').isString;
var validatorDefinitions = require('./definitions');
var aliases = require('./aliases');

module.exports = {};
module.exports.Validator = (function moduleDefinition() {
  'use strict';

  var defaultOptions = {
    /** strict validation */
    strict: false,
    /** convert data to its canonical form */
    canonize: true,
    /** if there are any errors, {@link R.Validator#valid} returns null */
    returnNullOnErrors: true,
    /** if true, it will not validate any other object after the first error */
    stopAfterFirstError: false,
    /** if true, a undefined value will validate */
    optional: false,
    /** value to return if doesn't validates and {@link options.optional} is true */
    defaultValue: undefined,
    /** object with the default validators to load with {@link R.Validator.addValidator} */
    validators: undefined,
    /** if an existing validator is defined and this option is false, an exception will raise */
    allowOverwriteValidator: false,
    /** `undefined` values won't be included in valid() if this option is true */
    returnUndefined: true,
    /** Functions to apply (in order) to the data *before* validating. Validation and canonization is applied to the result */
    preTransform: undefined,
    /** Functions to apply (in order) to the data *after* validating. It affects raw and canonized data. Must not modify the original data */
    postTransform: undefined,
  };

  /**
   * Stores the data to be retrieved via {@link Validator#valid} and {@link Validator#error}
   *
   * @param {Validator} validator
   * @param {String}    key
   * @param {any}       originalData
   * @param {any}       canonizedData
   * @param {Boolean}   validates
   *
   * @static
   * @private
   */
  function store(validator, key, originalData, canonizedData, validates) {
    if (validates) {
      validator.ok[key] = canonizedData;
    } else {
      validator.wrong[key] = originalData;
    }
  }

  /**
   * Apply a transformation or a list of them to the given data
   *
   * @param  {any}                 data
   * @param  {function|function[]} transformation
   * @return {any}
   */
  function applyTransformation(data, transformation) {
    var i;

    if (!transformation) {
      return data;
    }

    if (isArray(transformation)) {
      for (i = 0; i < transformation.length; i++) {
        data = transformation[i](data);
      }
    } else {
      data = transformation(data);
    }

    return data;
  }

  /**
   * Validates a simple data with the specified validator definition
   *
   * @param {Validator} validator
   * @param {Function}  validatorDefinition
   * @param {String}    key
   * @param {any}       data
   * @param {Object}    [options]
   *
   * @static
   * @private
   */
  function validateData(validator, validatorDefinition, key, data, options) {
    var res;
    var td; // transformed data

    options = extend({}, Validator.defaultOptions, validator.options, options);

    if (options.stopAfterFirstError && !isEmpty(validator.wrong)) {
      return;
    }

    try {
      data = applyTransformation(data, options && options.preTransform);
      data = applyTransformation(data, options && options.preTransformItem);
    } catch (e) {
      store(validator, key, data, data, false);
      return;
    }

    if (data === undefined && options.optional) {
      res = {
        data: options.defaultValue !== undefined ? options.defaultValue : undefined,
        valid: true,
      };
    } else {
      res = validatorDefinition(data, options);
    }

    if ((res && (!res.valid || res.data !== undefined)) || options.returnUndefined) {
      td = options.canonize ? res.data : data;
      try {
        td = applyTransformation(td, options && options.postTransformItem);
        td = applyTransformation(td, options && options.postTransform);
      } catch (e) {
        store(validator, key, data, data, false);
        return;
      }
      store(validator, key, data, td, res.valid);
    }
  }

  /**
   * Validates each element of an array via a specified validator
   * It doesn't modify the original array
   *
   * @param {Validator} validator
   * @param {Function}  validatorDefinition function to validate and canonize each element
   * @param {String}    key                 key to access the data later
   * @param {mixed}     data                array to validate
   * @param {Object}    [options]           options for this validation
   *                                        The validator needs to check for options.strict
   *
   * @static
   * @private
   */
  function validateArray(validator, validatorDefinition, key, data, options) {
    var ok = true;
    var val;
    var item;
    var res;
    var i;
    var n;

    options = extend({}, Validator.defaultOptions, validator.options, options);

    if (options.stopAfterFirstError && !isEmpty(validator.wrong)) {
      return;
    }

    try {
      data = applyTransformation(data, options && options.preTransform);
    } catch (e) {
      store(validator, key, data, data, false);
      return;
    }

    if (isArray(data)) {
      val = data.slice();
      for (i = 0, n = val.length; i < n; i++) {
        try {
          item = applyTransformation(val[i], options && options.preTransformItem);
        } catch (e) {
          store(validator, key, data, data, false);
          return;
        }
        res = validatorDefinition(item, options);

        if (!res.valid) {
          ok = false;
          break;
        }

        if (options.canonize) {
          val[i] = res.data;
        }

        try {
          val[i] = applyTransformation(val[i], options && options.postTransformItem);
        } catch (e) {
          store(validator, key, data, data, false);
          return;
        }
      }
    } else if (data === undefined && options.optional) {
      if (options.defaultValue !== undefined) {
        val = options.defaultValue;
      }

      ok = true;
    } else {
      ok = false;
    }

    if ((res && (!res.valid || res.data !== undefined)) || options.returnUndefined) {
      try {
        val = applyTransformation(val, options && options.postTransform);
      } catch (e) {
        store(validator, key, data, data, false);
        return;
      }
      store(validator, key, data, val, ok);
    }
  }

  /**
   * Validates each element of an object via a specified validator
   * It doesn't modify the original object
   *
   * @param {Validator} validator
   * @param {Function}  validatorDefinition function to validate and canonize each element
   * @param {string}    key                 key to access the data later
   * @param {mixed}     data                array to validate
   * @param {object}    [options]           options for this validation
   *
   * @static
   * @private
   */
  function validateObject(validator, validatorDefinition, key, data, options) {
    var ok = true;
    var val;
    var item;
    var res;
    var i;

    options = extend({}, Validator.defaultOptions, validator.options, options);

    if (options.stopAfterFirstError && !isEmpty(validator.wrong)) {
      return;
    }

    try {
      data = applyTransformation(data, options && options.preTransform);
    } catch (e) {
      store(validator, key, data, data, false);
      return;
    }

    if (isObject(data)) {
      val = extend(true, {}, data);
      for (i in data) {
        try {
          item = applyTransformation(val[i], options && options.preTransformItem);
        } catch (e) {
          store(validator, key, data, data, false);
          return;
        }
        res = validatorDefinition(item, options);

        if (!res.valid) {
          ok = false;
          break;
        }

        if (options.canonize) {
          val[i] = res.data;
        }
        try {
          val[i] = applyTransformation(val[i], options && options.postTransformItem);
        } catch (e) {
          store(validator, key, data, data, false);
          return;
        }
      }
    } else if (data === undefined && options.optional) {
      if (options.defaultValue !== undefined) {
        val = options.defaultValue;
      }

      ok = true;
    } else {
      ok = false;
    }

    if ((res && (!res.valid || res.data !== undefined)) || options.returnUndefined) {
      try {
        val = applyTransformation(val, options && options.postTransform);
      } catch (e) {
        store(validator, key, data, data, false);
        return;
      }
      store(validator, key, data, val, ok);
    }
  }

  /**
   * Constructor called when creating a new object instance
   *
   * @param {Object} options description
   *
   * @public
   */
  function Validator(options) {
    var i;

    this.options = options || {};
    this.ok = {};
    this.wrong = {};
    this.schemaList = {};

    if (this.options.validators) {
      for (i in this.options.validators) {
        this.addValidator(i, this.options.validators[i]);
      }
    }
  }

  // Global list of defined schemas
  Validator.schemaList = {};

  /**
   * Check for the objects that didn't passed the validation
   *
   * @return {Object} <code>null</code> if there are no errors,
   *                  or an object with the original value of each validated data
   * @public
   */
  Validator.prototype.errors = function errors() {
    return isEmpty(this.wrong) ? null : this.wrong;
  };

  /**
   * Get the data which validated
   *
   * @param  {object} base base object to use to return the valid elements.
   *                       Why? Because if we do <code>foo = valid()</code> we will overwrite
   *                       everything in <code>foo</code>, and maybe it had other values we
   *                       want to preserve. And if we do
   *                       <code>foo = $.extend(foo, valid())</code>
   *                       we can preserve possible values that are not in valid() because
   *                       of the canonization.
   * @return {object}      validated data as <code>{ key => value }</code>,
   *                       or null if there were errors and
   *                       <code>returnNullOnErrors</code> option is true
   *
   * @public
   */
  Validator.prototype.valid = function valid(base) {
    var v = null;
    var i;

    if (typeof base !== 'undefined' && !isObject(base)) {
      throw new Error('base needs to be a plain object if specified');
    }

    if (!this.options.returnNullOnErrors || isEmpty(this.wrong)) {
      if (base) {
        for (i in this.ok) {
          base[i] = this.ok[i];
        }
        v = base;
      } else {
        v = this.ok;
      }
    }

    return v;
  };

  /**
   * Clear the list of errors and validated data stored in the validator
   *
   * @return {Validator} Self object for allowing chaining
   *
   * @public
   */
  Validator.prototype.reset = function reset() {
    this.ok = {};
    this.wrong = {};

    return this;
  };

  /**
   * Clear the list of errors stored in the validator
   *
   * @return {Validator} Self object for allowing chaining
   *
   * @public
   */
  Validator.prototype.resetErrors = function resetErrors() {
    this.wrong = {};

    return this;
  };

  /**
   * Clear the list of validated data stored in the validator
   *
   * @return {Validator} Self object for allowing chaining
   *
   * @public
   */
  Validator.prototype.resetValid = function resetValid() {
    this.ok = {};

    return this;
  };

  /**
   * Add a custom data validator to a {@link Validator} instance
   *
   * @param  {String}    name                Name of the validator
   * @param  {Function}  validatorDefinition Definition of the validator
   * @return {Validator}                     this instance to allow method chaining
   *
   * @public
   * @see Validator.addValidator
   */
  Validator.prototype.addValidator = function addValidator(name, validatorDefinition) {
    Validator.addValidator(name, validatorDefinition, this);

    return this;
  };

  /**
   * Add a custom data validator to a {@link Validator} instance
   *
   * @param  {String}    alias         Name of the alias (new validator)
   * @param  {String}    validatorName Existing validator to call when calling this alias
   * @param  {Object}    [options]     Default options to pass to the validator when calling the alias
   * @return {Validator}               this instance to allow method chaining
   *
   * @public
   * @see Validator.addValidator
   */
  Validator.prototype.addAlias = function addValidator(alias, validatorName, options) {
    Validator.addAlias(alias, validatorName, options, this);

    return this;
  };

  /**
   * Validates data against an specified schema.
   * Properties in the `data` that are not defined in the schema will be ignored.
   *
   * @param  {String}    name Name of the schema to use
   * @param  {Object}    data Data to validate as `{ key: value }`
   * @return {Validator}      this instance to allow method chaining
   *
   * @public
   */
  Validator.prototype.schema = function schema(name, data) {
    var schemaDefinition = this.schemaList[name] || Validator.schemaList[name];
    var key;
    var property;

    if (!schemaDefinition) {
      throw new Error('Schema not found');
    }

    this.reset();
    for (key in schemaDefinition) {
      property = schemaDefinition[key];
      this[property.validator](key, data[key], property.options);
    }

    return this;
  };

  /**
   * Add a custom data validator to a {@link Validator} instance
   *
   * @param  {String}    schemaName    Name of the alias (new validator)
   * @param  {String}    schema        Definition of the schema as `[{ name, validator, options }]`
   * @param  {Object}    [options]     Default options to pass to the validator when calling any of the alias
   * @return {Validator}               this instance to allow method chaining
   *
   * @see Validator.addSchema
   */
  Validator.prototype.addSchema = function addSchema(schemaName, schema, options) {
    Validator.addSchema(schemaName, schema, options, this);

    return this;
  };

  /**
   * Add a custom data validator for a plain data.
   * Three validators will be created:
   * <ul>
   *   <li><code>name</code>: to validate plain data as specified (<code>elem</code>)</li>
   *   <li><code>nameArray</code>: to validate a list of elements (<code>[elem]</code>)</li>
   *   <li><code>nameObject</code>: to validate a collection of object values (not keys) (<code>{ key => elem }</code>)</li>
   *
   * @param  {String}   name                Name of the validator
   * @param  {Function} validatorDefinition Definition of the validator:
   *                                        <code>function(data, options)</code> returning
   *                                        <code>{ data, valid }</code>, where:
   *                                        <ul>
   *                                        <li>parameters:
   *                                          <ul>
   *                                            <li><code>data</code>: is the data to validate</li>
   *                                            <li><code>options</code>: are the options to apply when validating</li>
   *                                          </ul>
   *                                        <li>return object:
   *                                          <ul>
   *                                            <li><code>data</code>: a copy of the data, canonized</li>
   *                                            <li><code>valid</code>: a boolean telling if it validated or not</li>
   *                                          </ul>
   *                                        </ul>
   * @param  {Validator}   [validator]      If not specified, the {@link validatorDefinition} will be added to the prototype.
   *                                        If a validator is specified, it will added only for that validator instance.
   *
   * @public
   */
  Validator.addValidator = function addValidator(name, validatorDefinition, validator) {
    var target = validator || Validator.prototype;
    var opt = validator ? validator.options : defaultOptions;
    var nameArray;
    var nameObject;

    // validator for simple data
    function dataValidator(key, data, options) {
      validateData(this, validatorDefinition, key, data, options);
      return this;
    }

    // validator for array of data
    function arrayValidator(key, data, options) {
      validateArray(this, validatorDefinition, key, data, options);
      return this;
    }

    // validator for object of whatever key => data
    function objectValidator(key, data, options) {
      validateObject(this, validatorDefinition, key, data, options);
      return this;
    }

    /*
     * Data validation
     */
    if (!name || !isString(name)) {
      throw new Error('the specified name is not valid');
    }

    if (!isFunction(validatorDefinition)) {
      throw new Error('validatorDefinition needs to be a function');
    }

    if (validator && !(validator instanceof Validator)) {
      throw new Error('validator is not a Validator instance');
    }

    nameArray = name + 'Array';
    nameObject = name + 'Object';

    if (!opt.allowOverwriteValidator) {
      if (target[name]) {
        throw new Error('The method ' + name + ' is already defined');
      }

      if (target[nameArray]) {
        throw new Error('The method ' + nameArray + ' is already defined');
      }

      if (target[nameObject]) {
        throw new Error('The method ' + nameObject + ' is already defined');
      }
    }

    /*
     * Method addition
     */
    target[name] = dataValidator;
    target[nameArray] = arrayValidator;
    target[nameObject] = objectValidator;
  };

  /**
   * Add an alias for an existing validator
   *
   * @param  {String}    alias         Name of the alias (new validator)
   * @param  {String}    validatorName Existing validator to call when calling this alias
   * @param  {Object}    [options]     Default options to pass to the validator when calling the alias
   * @param  {Validator} [validator]   If not specified, the {@link alias} will be added to the prototype.
   *                                   If a validator is specified, it will added only for that validator instance.
   *
   * @public
   */
  Validator.addAlias = function addAlias(alias, validatorName, options, validator) {
    var target = validator || Validator.prototype;
    var opt = validator ? validator.options : defaultOptions;
    var aliasArray;
    var aliasObject;
    var nameArray;
    var nameObject;

    // alias for simple data
    function basicAlias(key, data, calledOptions) {
      options = extend(options, calledOptions);
      return target[validatorName].call(this, key, data, options);
    }

    // alias for array of data
    function arrayAlias(key, data, calledOptions) {
      options = extend(options, calledOptions);
      return target[nameArray].call(this, key, data, options);
    }

    // alias for object of whatever key => data
    function objectAlias(key, data, calledOptions) {
      options = extend(options, calledOptions);
      return target[nameObject].call(this, key, data, options);
    }

    nameArray = validatorName + 'Array';
    nameObject = validatorName + 'Object';

    if (!target[validatorName]) {
      throw new Error('The method ' + validatorName + ' is undefined');
    }

    if (!target[nameArray]) {
      throw new Error('The method ' + nameArray + ' is undefined');
    }

    if (!target[nameObject]) {
      throw new Error('The method ' + nameObject + ' is undefined');
    }

    aliasArray = alias + 'Array';
    aliasObject = alias + 'Object';

    if (!opt.allowOverwriteValidator) {
      if (target[alias]) {
        throw new Error('The method ' + alias + ' is already defined');
      }

      if (target[aliasArray]) {
        throw new Error('The method ' + aliasArray + ' is already defined');
      }

      if (target[aliasObject]) {
        throw new Error('The method ' + aliasObject + ' is already defined');
      }
    }

    /*
     * Alias addition
     */
    target[alias] = basicAlias;
    target[aliasArray] = arrayAlias;
    target[aliasObject] = objectAlias;
  };

  // add default validators
  (function addDefaultValidators() {
    var name;

    for (name in validatorDefinitions) {
      Validator.addValidator(name, validatorDefinitions[name]);
    }
  }());

  // add default aliases
  (function addDefaultAliases() {
    var definition;
    var i;
    var n;

    for (i = 0, n = aliases.length; i < n; i++) {
      definition = aliases[i];
      Validator.addAlias(definition.alias, definition.validator, definition.options);
    }
  }());

  /**
   * Add a custom data validator to a {@link Validator} instance
   *
   * @param  {String}    schemaName    Name of the alias (new validator)
   * @param  {String}    schema        Definition of the schema as `{ key: { validator, options } }`
   * @param  {Object}    [options]     Default options to pass to the validator when calling any of the alias
   * @param  {Validator} [validator]   If not specified, the {@link alias} will be added to the prototype.
   *                                   If a validator is specified, it will added only for that validator instance.
   *
   * @public
   */
  Validator.addSchema = function addSchema(schemaName, schema, options, validator) {
    var target = (validator && validator.schemaList) || Validator.schemaList;
    var opt = validator ? validator.options : defaultOptions;
    var definition = {};
    var property;
    var key;

    if (!opt.allowOverwriteValidator && target[schemaName]) {
      throw new Error('The schema ' + schemaName + ' is already defined');
    }

    for (key in schema) {
      property = schema[key];
      definition[key] = {
        validator: property.validator,
        options: property.options,
      };
    }

    target[schemaName] = definition;
  };

  // make defaultOptions public
  Validator.defaultOptions = defaultOptions;

  return Validator;
}());
