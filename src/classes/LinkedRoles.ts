import { REST } from "@discordjs/rest";
import ModuleError from "../utils/Error";
import { Routes, RESTGetAPIOAuth2CurrentAuthorizationResult } from "discord-api-types/v10";
import { APIMetadataField, APIUpdateMetadata, AttachExpressAppOptions, LinkedRolesOptions, OAuthUser, Object, UserStorage } from "../typings/Interfaces";
import { FieldBuilder } from "./Field";
import { isFieldBuilder } from "../utils/isBuilder";
import { Express } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import fetch from "node-fetch";
import { FieldType } from "../typings/Enums";

export class LinkedRoles {
    public token: string;
    public rest: REST;
    public clientId: string;
    public platformName: string;
    public redirectURL: string;
    public secret: string;
    public cookieSecret: string;
    private store: UserStorage;

    constructor({ clientId, token, platformName, redirectURL, secret, cookieSecret, storage }: LinkedRolesOptions) {
        this.token = token;
        this.secret = secret;
        this.clientId = clientId;
        this.platformName = platformName;
        this.redirectURL = redirectURL;
        this.cookieSecret = cookieSecret;
        this.store = storage;
        this.rest = new REST({ version: '10' }).setToken(token);
    }

    private verifyOptions(token?: string, clientId?: string, platformName?: string, redirectURL?: string) {
        const PlatformName = (platformName ?? this.platformName);
        const RedirectURL = (redirectURL ?? this.redirectURL);
        const Token = (token ?? this.token);
        const Secret = (this.secret);
        const CookieSecret = (this.cookieSecret);
        const ClientId = (clientId ?? this.clientId);
        const Store = this.store;

        if (Token == null || typeof Token != "string") throw new ModuleError({
            header: "INVALID_TOKEN",
            message: "Invalid token provided"
        });
        if (RedirectURL == null || typeof RedirectURL != "string") throw new ModuleError({
            header: "INVALID_REDIRECT_URL",
            message: "Invalid redirect url provided"
        });
        if (PlatformName == null || typeof PlatformName != "string") throw new ModuleError({
            header: "INVALID_PLATFORM_NAME",
            message: "Invalid platform name provided"
        });
        if (Secret == null || typeof Secret != "string") throw new ModuleError({
            header: "INVALID_SECRET",
            message: "Invalid secret provided"
        });
        if (Store == null) throw new ModuleError({
            header: "INVALID_STORAGE",
            message: "Invalid user storage provided"
        });
        if (CookieSecret == null || typeof CookieSecret != "string") throw new ModuleError({
            header: "INVALID_COOKIE_SECRET",
            message: "Invalid cookie secret provided"
        });
        if (ClientId == null || typeof ClientId != "string") throw new ModuleError({
            header: "INVALID_CLIENT_ID",
            message: "Invalid client id provided"
        });
    }

    public GetMetadataRecords() {
        this.verifyOptions();
        const { rest } = this;

        return rest.get(Routes.applicationRoleConnectionMetadata(this.clientId)) as Promise<APIMetadataField[]>;
    }

    public SetMetadataRecords(fields: (APIMetadataField | FieldBuilder)[]) {
        this.verifyOptions();
        const { rest } = this;

        return rest.put(Routes.applicationRoleConnectionMetadata(this.clientId), {
            body: fields.map(record => isFieldBuilder(record) ? record.toJSON() : record)
        });
    }

    private async PushMetadata(userId: string, tokens: OAuthUser, metadata: APIUpdateMetadata[]) {
        //`https://discord.com/api/v10/users/@me/applications/${this.clientId}/role-connection`;
        const url = Routes.userApplicationRoleConnection(this.clientId);
        const accessToken = await this.getAccessToken(userId, tokens);
        const body = {
            platform_name: this.platformName,
            metadata,
        };
        const response = await this.rest.put(url, {
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response;
    }

    private async storeDiscordTokens(userId: string, tokens: OAuthUser) {
        return await this.store.set(`discord-${userId}`, tokens);
    }

    private async getDiscordTokens(userId: string) {
        return await this.store.get(`discord-${userId}`);
    }

    private async updateMetadata(userId: string, scheme: APIMetadataField[], newFields: APIUpdateMetadata[]) {
        // Fetch the Discord tokens from storage
        const tokens = await this.getDiscordTokens(userId);

        const metadata = newFields;

        // Push the data to Discord.
        await this.PushMetadata(userId, tokens, metadata);
    }

    public getOAuthURL() {
        const state = crypto.randomUUID();

        const url = new URL('https://discord.com/api/oauth2/authorize');
        url.searchParams.set('client_id', this.clientId);
        url.searchParams.set('redirect_uri', this.redirectURL);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', state);
        url.searchParams.set('scope', 'role_connections.write identify');
        url.searchParams.set('prompt', 'consent');
        return { state, url: url.toString() };
    }

    /**
     * Given an OAuth2 code from the scope approval page, make a request to Discord's
     * OAuth2 service to retreive an access token, refresh token, and expiration.
     */
    private async getOAuthTokens(code: string): Promise<any> {
        const url = 'https://discord.com/api/v10/oauth2/token';
        const body = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.secret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectURL
        });

        const response = await fetch(url, {
            body,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
        }
    }

    /**
     * The initial token request comes with both an access token and a refresh
     * token.  Check if the access token has expired, and if it has, use the
     * refresh token to acquire a new, fresh access token.
     */
    private async getAccessToken(userId, tokens) {
        if (Date.now() > tokens.expires_at) {
            const url = 'https://discord.com/api/v10/oauth2/token';
            const body = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.secret,
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token,
            });
            const response = await fetch(url, {
                body,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.ok) {
                const tokens = await response.json() as any;
                tokens.access_token = tokens.access_token;
                tokens.expires_at = Date.now() + tokens.expires_in * 1000;
                await this.storeDiscordTokens(userId, tokens);
                return tokens.access_token;
            } else {
                throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
            }
        }
        return tokens.access_token;
    }

    /**
     * Given a user based access token, fetch profile information for the current user.
     */
    private async getUserData(tokens: OAuthUser) {
        //'https://discord.com/api/v10/oauth2/@me'
        const url = Routes.oauth2CurrentAuthorization();
        const response = await this.rest.get(url, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        return response as Promise<RESTGetAPIOAuth2CurrentAuthorizationResult>;
    }

    public async AttachExpressApp({ app, verify }: AttachExpressAppOptions) {
        app.use(cookieParser(this.cookieSecret));
        app.get('/verified-role', async (req, res) => {
            const { url, state } = this.getOAuthURL();

            // Store the signed state param in the user's cookies so we can verify
            // the value later. See:
            // https://discord.com/developers/docs/topics/oauth2#state-and-security
            res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

            // Send the user to the Discord owned OAuth2 authorization endpoint
            res.redirect(url);
        });

        /**
         * Route configured in the Discord developer console, the redirect Url to which
         * the user is sent after approving the bot for their Discord account. This
         * completes a few steps:
         * 1. Uses the code to acquire Discord OAuth2 tokens
         * 2. Uses the Discord Access Token to fetch the user profile
         * 3. Stores the OAuth2 Discord Tokens in Redis / Firestore
         * 4. Lets the user know it's all good and to go back to Discord
         */
        app.get('/discord-oauth-callback', async (req, res) => {
            try {
                // 1. Uses the code and state to acquire Discord OAuth2 tokens
                const code = req.query['code'];
                const discordState = req.query['state'];
                const Fields = await this.GetMetadataRecords();

                // make sure the state parameter exists
                const { clientState } = req.signedCookies;
                if (clientState !== discordState) {
                    console.error('State verification failed.');
                    return res.sendStatus(403);
                }

                const tokens = await this.getOAuthTokens(code as string);

                // 2. Uses the Discord Access Token to fetch the user profile
                const meData = await this.getUserData(tokens);
                const userId = meData.user.id;
                await this.storeDiscordTokens(userId, {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: Date.now() + tokens.expires_in * 1000,
                });

                // 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
                const newFields = await Promise.all(Fields.map(async e => ({
                    key: e.key,
                    value: await verify(meData.user, e)
                })));
                await this.updateMetadata(userId, Fields, newFields);

                res.send('You did it!  Now go back to Discord.');
            } catch (e) {
                console.error(e);
                res.sendStatus(500);
            }
        });

        /**
         * Example route that would be invoked when an external data source changes. 
         * This example calls a common `updateMetadata` method that pushes static
         * data to Discord.
         */
        app.post('/update-metadata', async (req, res) => {
            try {
                const userId = req.body.userId;
                //await this.updateMetadata()

                res.sendStatus(204);
            } catch (e) {
                res.sendStatus(500);
            }
        });
    }
}