#!/usr/bin/env bash

set -e

MR_BRANCH_NAME="$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME"

echo "Merge Request Branch Name: $MR_BRANCH_NAME"

MR_TITLE="$CI_MERGE_REQUEST_TITLE"

echo "Merge Request Title: $MR_TITLE"

EXCEPTION_MR_BRANCH_REGEX="^((revert-.+)|(cherry-pick-.+)|(fb-.+)|main|develop|release)$"

if [[ $MR_BRANCH_NAME =~ $EXCEPTION_MR_BRANCH_REGEX ]]; then
  exit 0
fi

VALID_MR_TITLE_REGEX="^(Draft: )?\[[A-Z]+-[0-9]+\] .+$"

RENOVATE_MR_BRANCH_REGEX="^renovate/.+$"

if [[ ! $MR_BRANCH_NAME =~ $RENOVATE_MR_BRANCH_REGEX ]] && [[ ! $MR_TITLE =~ $VALID_MR_TITLE_REGEX ]]; then
  echo "Merge request names in this project must adhere to this contract: $VALID_MR_TITLE_REGEX. You should rename your merge request title to a valid name and try again."

  exit 1
fi

echo "$MR_TITLE" | sed -E 's/^(Draft: )?\[[A-Z]+-[0-9]+\] //' | pnpm commitlint

echo "Merge request title is valid."

exit 0
