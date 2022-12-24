import { Locale } from "discord-api-types/v10";
import { APIMetadataField, Object } from "../typings/Interfaces";
import { FieldType } from "../typings/Enums";

export class FieldBuilder {
    /**
     * The name of this metadata field
     */
    public name: string;

    /**
     * The name localizations for this metadata field
     */
    public nameLocalizations: Object<Locale, string>;

    /**
     * The description of this metadata field
     */
    public description: string;

    /**
     * The description localizations for this metadata field
     */
    public descriptionLocalizations: Object<Locale, string>;

    /**
     * The dictionary key for this metadata field
     */
    public key: string;

    /**
     * The type of this metadata field
     */
    public type: FieldType;

    setType(type: FieldType) {
        this.type = type
        return this;
    }

    setName(name: string) {
        this.name = name
        return this;
    }

    setDescription(description: string) {
        this.description = description
        return this;
    }

    setKey(key: string) {
        this.key = key
        return this;
    }

    toJSON(): APIMetadataField {
        return {
            name: this.name,
            description: this.description,
            key: this.key,
            type: this.type,
            description_localizations: this.descriptionLocalizations,
            name_localizations: this.nameLocalizations
        }
    }
}