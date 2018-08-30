// @flow
import defaultConfig from 'lib/config';
import { getCookie } from 'lib/cookies';

const CookieNames = {
    PW_MANAGER_DISMISSED: 'GU_PWMANAGER_DISMISSED',
};

class IdentityFeatures {
    promptForSignIn: any;

    constructor(config: any = defaultConfig) {
        const isArticle = config.page.contentType === 'Article';
        const isInteractive = config.page.contentType === 'Interactive';

        this.promptForSignIn =
            !isArticle &&
            !isInteractive &&
            // $FlowFixMe
            navigator.credentials &&
            window.PasswordCredential &&
            getCookie(CookieNames.PW_MANAGER_DISMISSED) === null;
    }
}

export const identityFeatures = new IdentityFeatures();

export const IdentityCookies = CookieNames;
