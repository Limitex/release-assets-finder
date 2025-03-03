import { jest } from '@jest/globals'

// Create a mock for Octokit
const OctokitMock = jest.fn()

jest.unstable_mockModule('@octokit/rest', () => ({
  Octokit: OctokitMock
}))

// Import the module after setting up the mock
const { GitHubReleaseClient } = await import('../src/github-release-client')

// Type definitions
type ListReleasesParams = {
  owner: string
  repo: string
  per_page: number
  page: number
}

type ReleaseAsset = {
  name: string
  browser_download_url: string
}

type ReleaseData = {
  tag_name: string | null
  assets: ReleaseAsset[]
}

type ListReleasesFunction = (
  params: ListReleasesParams
) => Promise<{ data: ReleaseData[] }>

describe('GitHubReleaseClient', () => {
  let mockListReleases: jest.MockedFunction<ListReleasesFunction>

  beforeEach(() => {
    jest.resetAllMocks()
    mockListReleases = jest.fn() as jest.MockedFunction<ListReleasesFunction>
    // When creating an Octokit instance, replace repos.listReleases with our mock
    OctokitMock.mockImplementation(() => ({
      repos: {
        listReleases: mockListReleases
      }
    }))
  })

  test('getAllReleases retrieves releases across multiple pages', async () => {
    // First page returns a release, second page returns an empty array
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
    const fakeReleases: ReleaseData[] = [
      {
        tag_name: 'v1.0.0',
        assets: [
          {
            name: 'file1.zip',
            browser_download_url: 'http://example.com/file1.zip'
          },
          {
            name: 'file1.txt',
            browser_download_url: 'http://example.com/file1.txt'
          }
        ]
      },
      {
        tag_name: 'v1.1.0',
        assets: [
          {
            name: 'file2.zip',
            browser_download_url: 'http://example.com/file2.zip'
          }
        ]
      },
      {
        tag_name: null,
        assets: [
          {
            name: 'file3.zip',
            browser_download_url: 'http://example.com/file3.zip'
          }
        ]
      }
    ]

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

    expect(assetUrls).toEqual({
      'v1.0.0': ['http://example.com/file1.zip'],
      'v1.1.0': ['http://example.com/file2.zip']
    })
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
