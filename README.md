# Release Assets Finder

[![GitHub Super-Linter](https://github.com/limitex/release-assets-finder/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/limitex/release-assets-finder/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/limitex/release-assets-finder/actions/workflows/check-dist.yml/badge.svg)](https://github.com/limitex/release-assets-finder/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/limitex/release-assets-finder/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/limitex/release-assets-finder/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A simple GitHub Action to fetch release asset download URLs from a GitHub
repository.

## Overview

This action searches for release assets in a specified GitHub repository and
returns download URLs for assets that match a regular expression pattern.

## Usage

Basic example of using this action in your workflow file:

```yml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Find Release Assets
    id: find-assets
    uses: limitex/release-assets-finder@v0
    with:
      owner: <owner>
      repo: <repository>
      # pattern: '\.zip$'

  - name: Use Download Releases
    run: echo "${{ steps.find-assets.outputs.releases }}"
```

## Inputs

| Input     | Description                                 | Required |
| --------- | ------------------------------------------- | -------- |
| `owner`   | Repository owner                            | Yes      |
| `repo`    | Repository name                             | Yes      |
| `pattern` | Regular expression pattern to filter assets | No       |

## Outputs

| Output     | Description                           |
| ---------- | ------------------------------------- |
| `releases` | JSON string containing matching asset |

## Example Output

```json
[
  {
    "tag": "v1.0.0",
    "assets": [
      {
        "name": "example.zip",
        "downloadUrl": "https://github.com/octocat/example-repo/releases/download/v1.0.0/example.zip"
      }
    ]
  }
]
```

## License

Copyright (c) 2024 Limitex - MIT License
