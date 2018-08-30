// @flow
import { addCookie } from 'lib/cookies';
import fastdom from 'lib/fastdom-promise';
import {
    getUserFromCookie,
    isUserLoggedIn,
    ajaxSignIn,
} from 'common/modules/identity/api';
import {
    identityFeatures,
    IdentityCookies,
} from 'common/modules/identity/identity-features';
import ophan from 'ophan-tracker-js';

const updateCommentLink = (commentItems): void => {
    const user = getUserFromCookie();

    if (user) {
        commentItems.forEach(commentItem => {
            fastdom
                .read(() =>
                    commentItem.querySelector('.js-add-comment-activity-link')
                )
                .then(commentLink =>
                    fastdom.write(() => {
                        commentItem.classList.remove('u-h');
                        commentLink.setAttribute(
                            'href',
                            `https://profile.theguardian.com/user/id/${user.id}`
                        );
                    })
                );
        });
    }
};

const ONE_DAY_IN_MILLIS = 86400000;

const loginWithPasswordManager = (): Promise<boolean> => {
    if (identityFeatures.promptForSignIn) {
        // $FlowFixMe
        return navigator.credentials
            .get({
                password: true,
            })
            .then(creds => {
                if (creds) {
                    return ajaxSignIn(creds)
                        .then(cookies => {
                            const expiryDate = new Date(cookies.expiresAt);
                            const daysUntilExpiry =
                                (expiryDate.getTime() - new Date().getTime()) /
                                ONE_DAY_IN_MILLIS;
                            ophan.record({
                                component: 'pwmanager-api',
                                value: 'conversion',
                            });
                            cookies.values.forEach(cookie => {
                                addCookie(
                                    cookie.key,
                                    cookie.value,
                                    daysUntilExpiry
                                );
                            });
                            return Promise.resolve(true);
                        })
                        .catch(() => Promise.resolve(false));
                }
                ophan.record({
                    component: 'pwmanager-api',
                    value: 'impression',
                });
                addCookie(IdentityCookies.PW_MANAGER_DISMISSED, 'true', 7);
                return Promise.resolve(false);
            });
    }
    return Promise.resolve(false);
};

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        loginWithPasswordManager().then(isLoggedIn => {
            if (isLoggedIn) {
                return Promise.resolve(showMyAccountIfNecessary());
            }
        });
    } else {
        fastdom
            .read(() => ({
                signIns: [
                    ...document.querySelectorAll('.js-navigation-sign-in'),
                ],
                accountActionsLists: [
                    ...document.querySelectorAll(
                        '.js-navigation-account-actions'
                    ),
                ],
                commentItems: [
                    ...document.querySelectorAll('.js-show-comment-activity'),
                ],
                accountTrigger: document.querySelector(
                    '.js-user-account-trigger'
                ),
            }))
            .then(els => {
                const {
                    signIns,
                    accountActionsLists,
                    commentItems,
                    accountTrigger,
                } = els;

                return fastdom
                    .write(() => {
                        signIns.forEach(signIn => {
                            signIn.remove();
                        });

                        accountActionsLists.forEach(accountActions => {
                            accountActions.classList.remove('is-hidden');
                        });

                        // We still want the button to be hidden, but tabbable now
                        if (accountTrigger) {
                            accountTrigger.classList.remove('is-hidden');
                            accountTrigger.classList.add('u-h');
                        }
                    })
                    .then(() => {
                        updateCommentLink(commentItems);
                    });
            });
    }
};

export { showMyAccountIfNecessary };
