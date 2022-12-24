import { MetadataFieldBuilder } from "../classes/Field";

export function isMetadataFieldBuilder(builder: any): builder is MetadataFieldBuilder {
    return builder?.setName != null;
}