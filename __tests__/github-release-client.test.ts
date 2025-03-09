import { jest } from '@jest/globals'
import {
  OctokitMock,
  mockListReleases,
  resetOctokitMocks,
  createTestReleases
} from '../__fixtures__/octokit.js'

// Set up module mocks
jest.unstable_mockModule('@octokit/rest', () => ({
  Octokit: OctokitMock
}))

// Import the module after setting up mocks
const { GitHubReleaseClient } = await import('../src/github-release-client')

describe('GitHubReleaseClient', () => {
  beforeEach(() => {
    resetOctokitMocks()
  })

  test('getAllReleases retrieves releases across multiple pages', async () => {
    // First page returns releases, second page is empty
    mockListReleases
      .mockResolvedValueOnce({ data: [{ tag_name: 'v1.0.0', assets: [] }] })
      .mockResolvedValueOnce({ data: [] })

    const client = new GitHubReleaseClient()
    const releases = await client.getAllReleases('testOwner', 'testRepo')

    expect(mockListReleases).toHaveBeenCalledTimes(2)
    expect(releases).toHaveLength(1)
    expect(releases[0].tag_name).toBe('v1.0.0')
  })

  test('getMatchingAssetDownloadUrls returns correct asset URLs', async () => {
    const fakeReleases = createTestReleases()

    mockListReleases
      .mockResolvedValueOnce({ data: fakeReleases })
      .mockResolvedValueOnce({ data: [] })

    const client = new GitHubReleaseClient()
    const pattern = /\.zip$/
    const assetUrls = await client.getMatchingAssetDownloadUrls(
      'testOwner',
      'testRepo',
      pattern
    )

    expect(assetUrls).toEqual([
      {
        tag: 'v1.0.0',
        assets: [
          {
            name: 'file1.zip',
            downloadUrl: 'http://example.com/file1.zip'
          }
        ]
      },
      {
        tag: 'v1.1.0',
        assets: [
          {
            name: 'file2.zip',
            downloadUrl: 'http://example.com/file2.zip'
          }
        ]
      }
    ])
  })

  test('getAllReleases throws an error when Octokit fails', async () => {
    mockListReleases.mockRejectedValue(new Error('Network error'))
    const client = new GitHubReleaseClient()

    await expect(
      client.getAllReleases('testOwner', 'testRepo')
    ).rejects.toThrow('Network error')
  })

  test('getMatchingAssetDownloadUrls throws an error when getAllReleases fails', async () => {
    mockListReleases.mockRejectedValue(new Error('API failure'))
    const client = new GitHubReleaseClient()
    const pattern = /\.zip$/

    await expect(
      client.getMatchingAssetDownloadUrls('testOwner', 'testRepo', pattern)
    ).rejects.toThrow('API failure')
  })
})
