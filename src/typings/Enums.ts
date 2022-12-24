export enum ErrorHeaders {
    TokenInvalid = "TOKEN_INVALID",
    InvalidConstuctorArgument = "INVALID_CONSTRUCTOR_ARGUMENT"
}

export enum ErrorMessages {
    TokenInvalid = "Invalid token provided",
    //InvalidConstuctorArgument = "Invalid constructor argument recieved"
}

export enum FieldType {
    /**
     * The metadata value (integer) is less than or equal to the guild's configured value (integer)
     */
    IntegerLessThanOrEqual = 1,
    /**
     * The metadata value(integer) is greater than or equal to the guild's configured value (integer)
     */
    IntegerGreaterThanOrEqual = 2,
    /**
     * The metadata value(integer) is equal to the guild's configured value (integer)
     */
    IntegerEqual = 3,
    /**
     * The metadata value(integer) is not equal to the guild's configured value (integer)
     */
    IntegerNotEqual = 4,
    /**
     * The metadata value(ISO8601 string) is less than or equal to the guild's configured value (integer; days before current date)
     */
    DatetimeLessThanOrEqual = 5,
    /**
     * The metadata value(ISO8601 string) is greater than or equal to the guild's configured value (integer; days before current date)
     */
    DatetimeGreaterThanOrEqual = 6,
    /**
     * The metadata value(integer) is equal to the guild's configured value (integer; 1)
     */
    BooleanEqual = 7,
    /**
     * The metadata value(integer) is not equal to the guild's configured value (integer; 1)
     */
    BooleanNotEqual = 8
}

export enum Routes {

}
