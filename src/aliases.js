/*
 * List of aliases: give a name to validators with predefined options
 */
module.exports = (function defineAliases() {
  'use strict';

  var aliases = [{
    alias: 'notEmptyStr',
    validator: 'str',
    options: { minLength: 1 },
  }, {
    alias: 'positiveInt',
    validator: 'num',
    options: {
      integer: true,
      rangeMin: 1,
      minEq: true,
    },
  }];

  return aliases;
}());
