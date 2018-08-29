// @flow

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

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        // show pw manager popup
        console.log('not logged in');
        if (window.PasswordCredential) {
            // Call navigator.credentials.get() to retrieve stored
            // PasswordCredentials or FederatedCredentials.
            console.log('browser has support');
            // do the signin
            // $FlowFixMe
            navigator.credentials
                .get({
                    password: true,
                })
                .then(creds => {
                    if (creds) {
                        smartLockSignIn(creds, 'foo', 'bar');
                        console.log(creds);
                        // do login
                    } else {
                        console.log('no creds');
                    }
                });
        }
        return;
    }

    fastdom
        .read(() => ({
            signIns: [...document.querySelectorAll('.js-navigation-sign-in')],
            accountActionsLists: [
                ...document.querySelectorAll('.js-navigation-account-actions'),
            ],
            commentItems: [
                ...document.querySelectorAll('.js-show-comment-activity'),
            ],
            accountTrigger: document.querySelector('.js-user-account-trigger'),
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
};

export { showMyAccountIfNecessary };
