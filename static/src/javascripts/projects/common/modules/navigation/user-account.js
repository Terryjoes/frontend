// @flow
import { addCookie, getCookie } from 'lib/cookies';
import fastdom from 'lib/fastdom-promise';
import {
    getUserFromCookie,
    isUserLoggedIn,
    smartLockSignIn,
} from 'common/modules/identity/api';

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

const PW_MANAGER_DISMISSED = 'GU_PWMANAGER_DISMISSED';
const ONE_DAY_IN_MILLIS = 86400000;

const loginWithPasswordManager = (): Promise<boolean> => {
    if (window.PasswordCredential && getCookie(PW_MANAGER_DISMISSED) === null) {
        // $FlowFixMe
        return navigator.credentials
            .get({
                password: true,
            })
            .then(creds => {
                if (creds) {
                    return smartLockSignIn(creds).then(cookies => {
                        const expiryDate = new Date(cookies.expiresAt);
                        const daysUntilExpiry =
                            (expiryDate.getTime() - new Date().getTime()) /
                            ONE_DAY_IN_MILLIS;
                        cookies.values.forEach(cookie => {
                            addCookie(
                                cookie.key,
                                cookie.value,
                                daysUntilExpiry
                            );
                        });
                        return Promise.resolve(true);
                    });
                }
                // TODO: test if this works with no passwords saved
                addCookie(PW_MANAGER_DISMISSED, 'true', 30);
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
