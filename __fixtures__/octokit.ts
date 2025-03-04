import { jest } from '@jest/globals'

// Type definitions
export type ListReleasesParams = {
  owner: string
  repo: string
  per_page: number
  page: number
}

export type ReleaseAsset = {
  name: string
  browser_download_url: string
}

export type ReleaseData = {
  tag_name: string | null
  assets: ReleaseAsset[]
}

export type ListReleasesFunction = (
  params: ListReleasesParams
) => Promise<{ data: ReleaseData[] }>

// Mock implementation
export const mockListReleases =
  jest.fn() as jest.MockedFunction<ListReleasesFunction>

// Mock for Octokit class
export const OctokitMock = jest.fn().mockImplementation(() => ({
  repos: {
    listReleases: mockListReleases
  }
}))

// Module-level mocks
export const octokitModule = {
  Octokit: OctokitMock
}

// Helper function: reset all mocks
export function resetOctokitMocks(): void {
  mockListReleases.mockReset()
  OctokitMock.mockClear()
}

// Helper function to create test data
export function createTestReleases(): ReleaseData[] {
  return [
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
}
