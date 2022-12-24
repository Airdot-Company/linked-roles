import { FieldBuilder } from "../classes/Field";

export function isFieldBuilder(builder: any): builder is FieldBuilder {
    return builder?.setName != null;
}