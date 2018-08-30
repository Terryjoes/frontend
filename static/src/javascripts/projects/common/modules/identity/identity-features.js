// @flow
import defaultConfig from 'lib/config';
import {getCookie} from 'lib/cookies';

export const IdentityCookies = {
    PW_MANAGER_DISMISSED: 'GU_PWMANAGER_DISMISSED'
};

class IdentityFeatures {
    promptForSignin: any;

    constructor(config: any = defaultConfig) {
        const isArticle = config.page.contentType === 'Article';
        const isInteractive = config.page.contentType === 'Interactive';

        this.promptForSignin =
            !isArticle &&
            !isInteractive &&
            window.PasswordCredential &&
            getCookie(IdentityCookies.PW_MANAGER_DISMISSED) === null;
    }
}

export const identityFeatures = new IdentityFeatures();
