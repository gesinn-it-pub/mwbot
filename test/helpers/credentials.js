import defaultCredentials from '../mocking/loginCredentials.json' with { type: 'json' };

/**
 * Login credentials for the test wiki.
 * test/mocking/loginCredentials.local.json takes precedence if it exists.
 */
let loginCredentials = defaultCredentials;

try {
    const { default: loginCredentialsLocal } = await import('../mocking/loginCredentials.local.json', {
        with: { type: 'json' },
    });
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch {
    // no local credentials, use the defaults
}

export default loginCredentials;
