export type Transform = (data: any) => any;

export interface ValidatorOptions {
    /** strict validation */
    strict: boolean;
    /** convert data to its canonical form */
    canonize: boolean;
    /** if there are any errors, `valid` returns null */
    returnNullOnErrors: boolean;
    /** if true; it will not validate any other object after the first error */
    stopAfterFirstError: boolean;
    /** if true; a undefined value will validate */
    optional: boolean;
    /** value to return if doesn't validates and `optional` is true */
    defaultValue: any;
    /** object with the default validators to load with `addValidator` */
    validators: { [name: string]: ValidatorDefinition };
    /** if an existing validator is defined and this option is false, an exception will raise */
    allowOverwriteValidator: boolean;
    /** `undefined` values won't be included in valid() if this option is true */
    returnUndefined: boolean;
    /** Functions to apply (in order) to the raw data *before* validating. Validation and canonization is applied to the result */
    preTransform: Transform | Transform[];
    /** Functions to apply (in order) to **each** data item *before* validating. Validation and canonization is applied to the result */
    preTransformItem: Transform | Transform[];
    /** Functions to apply (in order) to **each** data item *after* validating. It affects raw and canonized data */
    postTransformItem: Transform | Transform[];
    /** Functions to apply (in order) to the data *after* validating. It affects raw and canonized data */
    postTransform: Transform | Transform[];
    /* Other options are possible in each validator */
    [key: string]: any;
}

export interface SchemaOptions extends ValidatorOptions {
  /** If `true`, passed data without an assigned validator, will be included -as it is- in the result, ommitted otherwise */
  includeExternal: boolean;
  /** If `true`, passed data without an assigned validator will not validate (`includeExternal` option will be ignored then) */
  externalShouldFail: boolean;
}

export interface ValidationResult<T> {
  /** a copy of the data, canonized (not needed if `valid` is `false`) */
  data: T;
  /** if it validated or not */
  valid: boolean;
}

export type ValidatorDefinition<T = any> = (
  /** data to validate */
  data: any,
  /** options to apply during the validation */
  options?: Partial<ValidatorOptions>
) => ValidationResult<T>;

export type SchemaDefinition = {
  [name: string]: {
    validator: string;
    options?: Partial<ValidatorOptions>;
  }
}

export interface DataDict { [key: string]: any }

export class Validator {
  constructor(options?: Partial<SchemaOptions>);

  public static readonly defaultOptions: SchemaOptions;

  /**
   * Add a custom data validator for a plain data.
   * Three validators will be created:
   *  - `name`: to validate plain data as specified (`elem`)
   *  - `nameArray`: to validate a list of elements (`[elem]`)
   *  - `nameObject`: to validate a collection of object values (not keys) (`{ key => elem }`)
   *
   * @param  name                Name of the validator
   * @param  validatorDefinition Definition of the validator
   * @param  validator           If not specified, the `validatorDefinition` will be added to the prototype.
   *                             If a validator is specified, it will added only for that validator instance.
   */
  public static addValidator(name: string, definition: ValidatorDefinition, validator?: Validator): void;

  /**
   * Add an alias for an existing validator
   *
   * @param  alias         Name of the alias (new validator)
   * @param  validatorName Existing validator to call when calling this alias
   * @param  options       Default options to pass to the validator when calling the alias
   * @param  validator     If not specified, the `alias` will be added to the prototype.
   *                       If a validator is specified, it will added only for that validator instance.
   */
  public static addAlias(aliasName: string, validatorName: string, options?: Partial<ValidatorOptions>, validator?: Validator): void;

  /**
   * Add a custom data validator
   *
   * @param schemaName  Name of the alias (new validator)
   * @param schema      Definition of the schema
   * @param options     Default options to pass to the validator when calling any of the alias
   * @param validator   If not specified, the `schema` will be added to the prototype.
   *                    If a validator is specified, it will added only for that validator instance.
   */
  public static addSchema(schemaName: string, definition: SchemaDefinition, options?: Partial<SchemaOptions>, validator?: Validator): void;

  /**
   * Check for the objects that didn't passed the validation
   *
   * @return `null` if there are no errors, or an object with the original value of each validated data
   */
  public errors<T = DataDict>(): T;

  /**
   * Get the data which validated
   *
   * @param base base object to use to return the valid elements.
   *             Why? Because if we do `foo = valid()` we will overwrite
   *             everything in `foo`, and maybe it had other values we
   *             want to preserve. And if we do `foo = $.extend(foo, valid())`
   *             we can preserve possible values that are not in valid() because of the canonization.
   * @return     validated data as `{ key : value }`,
   *             or null if there were errors and `returnNullOnErrors` option is true
   */
  public valid<T = DataDict>(base?: {}): T;

  /**
   * Clear the list of errors and validated data stored in the validator
   *
   * @return Self object for allowing chaining
   */
  public reset(): Validator;

  /**
   * Clear the list of errors stored in the validator
   *
   * @return Self object for allowing chaining
   */
  public resetErrors(): Validator;

  /**
   * Clear the list of validated data stored in the validator
   *
   * @return Self object for allowing chaining
   */
  public resetValid(): Validator;

  /**
   * Add a custom data validator to a `Validator` instance
   *
   * @param  name                Name of the validator
   * @param  validatorDefinition Definition of the validator
   * @return                     this instance to allow method chaining
   */
  public addValidator(name: string, definition: ValidatorDefinition): Validator;

  /**
   * Add a custom alias to a `Validator` instance
   *
   * @param  alias         Name of the alias (new validator)
   * @param  validatorName Existing validator to call when calling this alias
   * @param  [options]     Default options to pass to the validator when calling the alias
   * @return               this instance to allow method chaining
   */
  public addAlias(aliasName: string, validatorName: string, options?: Partial<ValidatorOptions>): Validator;

  /**
   * Validates data against an specified schema.
   * Properties in the `data` that are not defined in the schema will be ignored.
   *
   * @param  name Name of the schema to use
   * @param  data Data to validate as `{ key: value }`
   * @return      this instance to allow method chaining
   */
  public schema<T = DataDict>(schemaName: string, data: T): Validator;

  /**
   * Add a custom data validator to a {@link Validator} instance
   *
   * @param  schemaName Name of the alias (new validator)
   * @param  schema     Definition of the schema
   * @param  options    Default options to pass to the validators when calling any of the alias
   * @return            this instance to allow method chaining
   *
   * @see Validator.addSchema
   */
  public addSchema(schemaName: string, definition: SchemaDefinition, options?: Partial<SchemaOptions>): Validator;
}
