/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mock the GitHubReleaseClient class and its methods
const mockGetMatchingAssetDownloadUrls = jest.fn()
const mockGitHubReleaseClient = jest.fn().mockImplementation(() => ({
  getMatchingAssetDownloadUrls: mockGetMatchingAssetDownloadUrls
}))

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/github-release-client.js', () => ({
  GitHubReleaseClient: mockGitHubReleaseClient
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Mock the core.getInput method
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'owner':
          return 'testOwner'
        case 'repo':
          return 'testRepo'
        case 'pattern':
          return '.*\\.zip'
        default:
          return ''
      }
    })

    // Mock the return value of GitHubReleaseClient
    mockGetMatchingAssetDownloadUrls.mockImplementation(() =>
      Promise.resolve([
        {
          tag: 'v1.0.0',
          assets: [
            {
              name: 'asset1.zip',
              downloadUrl: 'https://example.com/asset1.zip'
            }
          ]
        },
        {
          tag: 'v1.1.0',
          assets: [
            {
              name: 'asset2.zip',
              downloadUrl: 'https://example.com/asset2.zip'
            },
            {
              name: 'asset3.zip',
              downloadUrl: 'https://example.com/asset3.zip'
            }
          ]
        }
      ])
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('outputs the correct URLs', async () => {
    await run()

    // Ensure getMatchingAssetDownloadUrls was called with the correct parameters
    expect(mockGetMatchingAssetDownloadUrls).toHaveBeenCalledWith(
      'testOwner',
      'testRepo',
      expect.any(RegExp)
    )

    // Ensure the output was set correctly
    expect(core.setOutput).toHaveBeenCalledWith(
      'releases',
      JSON.stringify(
        [
          {
            tag: 'v1.0.0',
            assets: [
              {
                name: 'asset1.zip',
                downloadUrl: 'https://example.com/asset1.zip'
              }
            ]
          },
          {
            tag: 'v1.1.0',
            assets: [
              {
                name: 'asset2.zip',
                downloadUrl: 'https://example.com/asset2.zip'
              },
              {
                name: 'asset3.zip',
                downloadUrl: 'https://example.com/asset3.zip'
              }
            ]
          }
        ],
        null,
        2
      )
    )
  })

  it('reports an error when an error occurs', async () => {
    // Simulate an error
    const errorClient = {
      getMatchingAssetDownloadUrls: jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error('API error')))
    }

    // Mock the GitHubReleaseClient class and its methods
    const errorMockGitHubReleaseClient = jest.fn().mockReturnValue(errorClient)

    // Reset the modules and mock the GitHubReleaseClient class
    jest.resetModules()
    jest.unstable_mockModule('@actions/core', () => core)
    jest.unstable_mockModule('../src/github-release-client.js', () => ({
      GitHubReleaseClient: errorMockGitHubReleaseClient
    }))

    // Re-import the module
    const { run: runWithError } = await import('../src/main.js')
    await runWithError()

    // Ensure the error was reported correctly
    expect(core.setFailed).toHaveBeenCalledWith('API error')
  })
})
