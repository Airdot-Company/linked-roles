import { ErrorHeaders, ErrorMessages } from "../typings/Enums";

export interface ErrorOptions {
    header: ErrorHeaders | string;
    message: ErrorMessages | string;
};

function GenerateErrorTemplate(name: string): ErrorOptions {
    return {
        header: ErrorHeaders[name],
        message: ErrorMessages[name]
    }
}

const Errors = {
    TokenInvalid: GenerateErrorTemplate("TokenInvalid")
};

export default class ModuleError extends Error {
    public static readonly Errors = Errors;

    constructor({ header, message }: ErrorOptions) {
        if (typeof message != "string")
            throw new ModuleError({
                message: `Expected a string for 'message', recieved ${typeof message}`,
                header: ErrorHeaders.InvalidConstuctorArgument
            });

        if (typeof header != "string")
            throw new ModuleError({
                message: `Expected a string for 'header', recieved ${typeof header}`,
                header: ErrorHeaders.InvalidConstuctorArgument
            });

        super(message);
        this.name = `Linked Roles Error [${header}]`;
    }
}