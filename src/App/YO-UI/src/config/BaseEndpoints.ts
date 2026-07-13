interface BaseUrls {
    api: string;
    base: string;
    cdn: string;
    identity: string;
    apiServer: string;
}

function getBaseEndPoints(): BaseUrls {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const apiPath = import.meta.env.VITE_API_PATH || '/api/v1';
    const cdnPath = import.meta.env.VITE_CDN_PATH || '';
    const identityServer = import.meta.env.VITE_IDENTITY_SERVER || '';
    const apiServer = import.meta.env.VITE_API_SERVER || '';
    return {
        api: `${apiBase}${apiPath}`,
        base: apiBase,
        cdn: cdnPath,
        identity: identityServer,
        apiServer: apiServer
    };
}

export const BaseEndpoints = getBaseEndPoints();