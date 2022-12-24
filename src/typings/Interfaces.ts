import { APIUser, Locale } from "discord-api-types/v10";
import { FieldType } from "./Enums"
import { Express } from "express";

export type Object<K extends string | number | symbol, V> = {
    [key in K]: V;
};;

export interface APIMetadataField {
    /**
     * Type of metadata value
     */
    type: FieldType;
    /**
     * Key for the metadata field(must be a - z, 0 - 9, or _ characters; max 50 characters)
    */
    key: string;
    /**
     * Name of the metadata field(max 100 characters)
     */
    name: string;
    /**
     * Name of the metadata field(max 100 characters)
     */
    name_localizations?: Object<Locale, string>;
    /**
     * Description of the metadata field(max 200 characters)
     */
    description: string;
    /**
     * Translations of the description
     */
    description_localizations?: Object<Locale, string>;
}

export interface UserStorage {
    get: (value: string) => Promise<OAuthUser> | OAuthUser;
    set: (key: string, values: OAuthUser) => any;
}

export interface LinkedRolesOptions {
    token: string;
    clientId: string;
    platformName: string;
    redirectURL: string;
    secret: string;
    cookieSecret: string;
    storage: UserStorage;
}

export interface OAuthUser {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface AttachExpressAppOptions {
    app: Express;
    verify: (user: APIUser, field: APIMetadataField) => boolean | Promise<boolean>;
}

export interface APIUpdateMetadata {
    key: string;
    value: boolean;
}
