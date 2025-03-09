import * as core from '@actions/core'
import { GitHubReleaseClient } from './github-release-client.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repo', { required: true })
    const pattern = core.getInput('pattern')

    const client = new GitHubReleaseClient()

    const regexp = new RegExp(pattern)
    const releaseAssets = await client.getMatchingAssetDownloadUrls(
      owner,
      repo,
      regexp
    )

    core.setOutput('releases', JSON.stringify(releaseAssets, null, 2))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
