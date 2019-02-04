/*
 * List of aliases: give a name to validators with predefined options
 */
module.exports = (function defineAliases() {
  'use strict';

  var aliases = [
    /* Alias for validating non-empty strings */
    {
      alias: 'notEmptyStr',
      validator: 'str',
      options: { minLength: 1 },
    },
    /* Alias for validating integers bigger than 0 (common ID fields) */
    {
      alias: 'positiveInt',
      validator: 'num',
      options: {
        integer: true,
        rangeMin: 1,
        minEq: true,
      },
    },
  ];

  return aliases;
}());
