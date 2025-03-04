import { RestEndpointMethodTypes } from '@octokit/rest';
export type Release = RestEndpointMethodTypes['repos']['listReleases']['response']['data'][number];
export type AssetUrlsByTag = {
    [tagName: string]: string[];
};
export type GitHubClientOptions = {
    perPage?: number;
    token?: string;
};
/**
 * Client class for fetching release information from GitHub repositories
 */
export declare class GitHubReleaseClient {
    private octokit;
    private options;
    /**
     * Initialize the GitHub client
     * @param options Client options
     */
    constructor(options?: GitHubClientOptions);
    /**
     * Fetch all releases from a repository
     * @param owner Repository owner
     * @param repo Repository name
     * @returns Array of release information
     */
    getAllReleases(owner: string, repo: string): Promise<Release[]>;
    /**
     * Get download URLs for assets matching a specific pattern
     * @param owner Repository owner
     * @param repo Repository name
     * @param pattern Regular expression pattern to match asset names (optional)
     * @returns Map of asset URLs by tag name
     */
    getMatchingAssetDownloadUrls(owner: string, repo: string, pattern?: RegExp): Promise<AssetUrlsByTag>;
}
