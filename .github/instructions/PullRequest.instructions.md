---
applyTo: '**'
---

Always ask for PR target branch(upstream), and the allowed targets branches are "development" and "main" branch
Always ask for the commits to be added to the PR in comma separated format and display the most reset commits using the following format:
`<commit id>: <commit title or message>`
Analyze the selected commits by id when generating the PR description
PR title must be a summary of all the selected commit messages with emoji
PR description must be generated as MD code snippet
Always Use the following template when generating PR(Pull Request) description

```md
# <Pull request title that best summaries the changes and the type of changes made with the appropriate emoji>

|   Status   |                Type                 | Env Vars Change |
| :--------: | :---------------------------------: | :-------------: |
| Ready/Hold | Feature/Bug/Tooling/Refactor/Hotfix |     Yes/No      |

> ⚠️ NOTE: <OPTIONAL: use notes like this to emphasize something about the PR. This could include other PRs this PR is built on top of; reasons for why the PR is on hold; or anything else you would like to draw attention to.>

## Problem

<What problem are you trying to solve?>

- problem 1
- problem 2
  ....

## Solution

<How did you solve the problem?>

- solution 1
- solution 2
  ....

## Test results

<This can be a list of links to test results or a description of the tests run or some UI screenshots of the new/updated feature.
If don't found any data relate, give exactly instruction "_Add your screenshots or recording about testing_" instead of "**NEED FILL**">

## Other changes <e.g. bug fixes, UI tweaks, small refactors>

- change 1
- change 2
  ....

## Deploy Notes

<Notes regarding deployment of the contained body of work. These should note any new dependencies, new scripts, etc.
If no have new info, only show exactly "_There are no new dependencies, scripts, or environment variables introduced with this PR_">

<OPTIONAL: (IMPORTANT) delete this field if don't have new environment variables>
**New environment variables **:

- `env var` : env var details

<OPTIONAL: (IMPORTANT) delete this field if don't have new scripts>
**New scripts**:

- `script` : script (DB migrations, etc) details

<OPTIONAL: (IMPORTANT) delete this field if don't have new dependencies>
**New dependencies**:

- `dependency` : dependency details

<OPTIONAL: (IMPORTANT) delete this field if don't have new dev dependencies>
**New dev dependencies**:

- `dependency` : dependency details
```
