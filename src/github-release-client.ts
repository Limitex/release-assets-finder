import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'

// Types
export type Release =
  RestEndpointMethodTypes['repos']['listReleases']['response']['data'][number]
export type AssetUrlsByTag = { [tagName: string]: string[] }
export type GitHubClientOptions = {
  perPage?: number
  token?: string
}

// Default config
const DEFAULT_OPTIONS: GitHubClientOptions = {
  perPage: 100
}

/**
 * Client class for fetching release information from GitHub repositories
 */
export class GitHubReleaseClient {
  private octokit: Octokit
  private options: GitHubClientOptions

  /**
   * Initialize the GitHub client
   * @param options Client options
   */
  constructor(options: GitHubClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.octokit = new Octokit({
      auth: this.options.token
    })
  }

  /**
   * Fetch all releases from a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Array of release information
   */
  async getAllReleases(owner: string, repo: string): Promise<Release[]> {
    try {
      let page = 1
      const allReleases: Release[] = []

      while (true) {
        const { data } = await this.octokit.repos.listReleases({
          owner,
          repo,
          per_page: this.options.perPage,
          page
        })

        if (data.length === 0) {
          break
        }

        allReleases.push(...data)
        page++
      }

      return allReleases
    } catch (error) {
      console.error(`Failed to fetch releases for ${owner}/${repo}:`, error)
      throw new Error(
        `Failed to fetch releases: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  /**
   * Get download URLs for assets matching a specific pattern
   * @param owner Repository owner
   * @param repo Repository name
   * @param pattern Regular expression pattern to match asset names (optional)
   * @returns Map of asset URLs by tag name
   */
  async getMatchingAssetDownloadUrls(
    owner: string,
    repo: string,
    pattern?: RegExp
  ): Promise<AssetUrlsByTag> {
    try {
      const releases = await this.getAllReleases(owner, repo)
      const result: AssetUrlsByTag = {}

      for (const release of releases) {
        if (!release.tag_name) continue

        const matchedUrls = release.assets
          .filter((asset) => !pattern || pattern.test(asset.name))
          .map((asset) => asset.browser_download_url)

        if (matchedUrls.length > 0) {
          result[release.tag_name] = matchedUrls
        }
      }

      return result
    } catch (error) {
      console.error(
        `Failed to get matching assets for ${owner}/${repo}:`,
        error
      )
      throw new Error(
        `Failed to get matching assets: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}
