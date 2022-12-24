import { OAuthUser, UserStorage } from "../typings/Interfaces";

export const DefaultStorage: () => UserStorage = (map: Map<string, OAuthUser> = new Map()) => ({
    get(value) {
        return map.get(value);
    },
    set(key, values) {
        return map.set(key, values);
    },
})