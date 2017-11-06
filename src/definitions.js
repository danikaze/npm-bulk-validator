/* eslint-disable eqeqeq */
var typeCheck = require('vanilla-type-check');
var truncate = require('truncate');

/*
 * List of validators added in the Validator prototype by default.
 */
module.exports = (function definitions() {
  'use strict';

  var validatorDefinitions = {
    defined: validatorDefined,
    bool: validatorBool,
    num: validatorNum,
    str: validatorStr,
    fn: validatorFn,
    enumerated: validatorEnumerated,
    enumeratedKey: validatorEnumeratedKey,
    enumeratedKeyValue: validatorEnumeratedKeyValue,
    json: validatorJson,
  };

  /*
   * Just check that the data exists (even if it's 0, "" or null)
   */
  function validatorDefined(data, options) {
    return {
      data: data,
      valid: data !== undefined,
    };
  }

  /*
   * Generic Boolean data validator
   *
   * If {@link options.strict} is false, it will just perform a !!data
   * and the validation will pass always (because everything can be casted to bool)
   * It will also check for string values
   * such as 'true' and '1' as true, and 'false' and '0' as false
   * every other string will fail the validation.
   *
   * If {@link options.strict} is true, only real boolean data
   * (<code>true</code>, <code>false</code>) will be acceped as valid data.
   */
  function validatorBool(data, options) {
    var val;
    var ok;

    if (options.strict) {
      val = data;
      ok = typeof data === 'boolean';
    } else if (typeCheck.isString(data)) {
      ok = true;
      if (data === 'false' || data == '0') {
        val = false;
      } else {
        val = !!data;
      }
    } else {
      val = !!data;
      ok = true;
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /*
   * Generic Number validator.
   * Note that the difference between range and min/max, is that range only validates but don't
   * modify the value.
   * {@link options.min}/{@link options.max} is applied before the range validation
   *
   * @param {Boolean}       [options.integer]  If true, it will use parseInt even if it's a float
   * @param {Number}        [options.min]      If the value is less than this, it will be clamped
   * @param {Number}        [options.max]      If the value is higher than this, it will be clamped
   * @param {Number}        [options.rangeMin] If the value is less than this it won't be valid
   * @param {Number}        [options.rangeMax] If the value is higher than this, it won't be valid
   * @param {Boolean}       [options.minEq]    If true, the {@link options.rangeMin} comparison will be done with <= instead <
   * @param {Boolean}       [options.maxEq]    If true, the {@link options.rangeMax} comparison will be done with >= instead >
   * @param {String|RegExp} [options.regExp]   If specified, it needs to match the RegExp to validate
   */
  function validatorNum(data, options) {
    var val;
    var ok;

    ok = options.strict ? typeCheck.isNumber(data)
                        : typeCheck.isNumeric(data) ||
                          data === Infinity ||
                          data === -Infinity;

    if (!ok) {
      return {
        data: val,
        valid: ok,
      };
    }

    val = options.integer ? Number(data) | 0
                          : Number(data);

    if (ok) {
      if (options.min !== undefined) {
        val = Math.max(options.min, val);
      }
      if (options.max !== undefined) {
        val = Math.min(val, options.max);
      }

      if (options.rangeMin !== undefined) {
        ok = options.minEq ? val >= options.rangeMin : val > options.rangeMin;
      }

      if (ok && options.rangeMax !== undefined) {
        ok = options.maxEq ? val <= options.rangeMax : val < options.rangeMax;
      }
    }

    if (ok && options.regExp) {
      if (typeCheck.isString(options.regExp)) {
        options.regExp = new RegExp(options.regExp);
      }
      ok = options.regExp.exec(data) !== null;
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /*
   * Generic String validator
   *
   * @param {Number}        [options.minLength] If specified, the data won't validate unless its length is greater than this option.
   * @param {Number}        [options.maxLength] If specified, the data won't validate unless its length is less than this option.
   * @param {Boolean}       [options.truncate]  If <code>true</code> the string will pass the validation, but will be truncated.
   * @param {String}        [options.append]    If specified AND the string is truncated, this will be appended.
   * @param {String|RegExp} [options.regExp]    If specified, it needs to match the RegExp to validate.
   *                                            It's applied after {@link truncate} but before {@link lowerCase} and {@link uppercase}.
   * @param {Boolean}       [options.lowerCase] If <code>true</code>, the string will be transformed to lowerCase.
   * @param {Boolean}       [options.upperCase] If <code>true</code>, the string will be transformed to upperCase.
   */
  function validatorStr(data, options) {
    var val = String(data);
    var ok = val != null && (!options.strict || typeCheck.isString(data));

    if (options.minLength && val.length < options.minLength) {
      ok = false;
    }

    if (ok && options.maxLength && val.length > options.maxLength) {
      if (options.truncate) {
        val = truncate(val, options.maxLength, { ellipsis: options.append || '' });
      } else {
        ok = false;
      }
    }

    if (ok && options.regExp) {
      ok = val.search(options.regExp) !== -1;
    }

    if (options.lowerCase) {
      val = val.toLowerCase();
    } else if (options.upperCase) {
      val = val.toUpperCase();
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /*
   * Generic Function validator
   */
  function validatorFn(data, options) {
    return {
      data: data,
      valid: typeCheck.isFunction(data),
    };
  }

  /*
   * Enum Validator.
   * Check that data is one of the values inside the definition of options.enum
   */
  function validatorEnumerated(data, options) {
    var val = null;
    var ok = false;
    var i;

    if (!options || !typeCheck.isObject(options.enumerated)) {
      throw Error('options.enumerated is not an Object');
    }

    for (i in options.enumerated) {
      if ((!options.strict && data == options.enumerated[i]) ||
          (options.strict && data === options.enumerated[i])) {
        val = options.enumerated[i];
        ok = true;
        break;
      }
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /**
   * Check that the data is a defined key in options.enum
   * Note that if {@link options.strict} is <code>true</code>, all the
   * comparations will be done with String type, since all object keys
   * are Stings
   */
  function validatorEnumeratedKey(data, options) {
    var val = null;
    var ok = false;
    var i;

    if (!options || !typeCheck.isObject(options.enumerated)) {
      throw Error('options.enumerated is not an Object');
    }

    for (i in options.enumerated) {
      if ((!options.strict && data == i) || (options.strict && data === i)) {
        val = i;
        ok = true;
        break;
      }
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /**
   * Check that the data is a defined key in options.enum, and return the associated value
   */
  function validatorEnumeratedKeyValue(data, options) {
    var val = null;
    var ok = false;
    var i;

    if (!options || !typeCheck.isObject(options.enumerated)) {
      throw Error('options.enumerated is not an Object');
    }

    for (i in options.enumerated) {
      if ((!options.strict && data == i) || (options.strict && data === i)) {
        val = options.enumerated[i];
        ok = true;
        break;
      }
    }

    return {
      data: val,
      valid: ok,
    };
  }

  /*
   * JSON Validator.
   * It accepts a JSON string and canonizes it into the parsed object/array/data
   * Note that functions and <code>NaN</code> are not parseable by JSON, so they are not supported.
   */
  function validatorJson(data, options) {
    var val;

    try {
      val = JSON.parse(data);
      return {
        data: val,
        valid: true,
      };
    } catch (e) {
      return {
        data: data,
        valid: false,
      };
    }
  }

  return validatorDefinitions;
}());
