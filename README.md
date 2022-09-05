# Add Zenhub release javascript action

Add an issue to Zenhub release. If the realase doesn't exist, it would be created automatically.

## Inputs

## `zenhub_token`

**Required** Zenhub token.

## `repo_id`

**Required** Github repository id.

## `issue_number`

**Required** The issue to be added to the Zenhub release.

## `release_name`

**Required** The Zenhub release name to be added/created.

## Example usage

uses: yangchiu/add-zenhub-release-action@master
with:
  zenhub_token: ${{ secrets.ZENHUB_TOKEN }}
  repo_id: ${{ fromJSON(steps.repo.outputs.data).id }}
  issue_number: ${{ github.event.issue.id }}
  release_name: 1.4.0