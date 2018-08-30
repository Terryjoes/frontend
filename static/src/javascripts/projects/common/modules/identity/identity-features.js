// @flow
import defaultConfig from 'lib/config';
import { getCookie } from 'lib/cookies';
import config from 'lib/config';

const CookieNames = {
    PW_MANAGER_DISMISSED: 'GU_PWMANAGER_DISMISSED',
};

class IdentityFeatures {
    promptForSignIn: any;

    constructor(config: any = defaultConfig) {
        this.promptForSignIn =
            config.get('page.isFront') &&
            // $FlowFixMe
            navigator.credentials &&
            window.PasswordCredential &&
            getCookie(CookieNames.PW_MANAGER_DISMISSED) === null;
    }
}

export const identityFeatures = new IdentityFeatures();

export const IdentityCookies = CookieNames;
