#!/bin/bash

# Change to root of project.
# See: http://stackoverflow.com/a/16349776/741892
cd "${0%/*}/.."

# Colors
# See: http://stackoverflow.com/a/5412776
BLUE=$(tput setaf 4)
CYAN=$(tput setaf 6)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
BOLD=$(tput bold)
NORMAL=$(tput sgr0)

printf "${CYAN}## Testing webpack build${NORMAL}\n"
npm run build-demo-wp || exit $?

EXPECTED="demo/build-1/stats.json
demo/build-2/copy.js
demo/build-2/deadbeef012345678901.main.js
demo/build-2/stats.json
demo/build-3/stats.json
demo/build-3/yo.js
demo/build-4/main.deadbeef012345678901.js
demo/build-4/nested/stats.json
demo/build/deadbeef012345678901.main.js
demo/build/stats.json
demo/main.js
demo/webpack.config.js"
ACTUAL=$(find demo -type f | sort)

if [ "$EXPECTED" != "$ACTUAL" ]; then
  printf "${BOLD}${RED}Test failed${NORMAL}\n\n"
  printf "* Expected: \n${GREEN}${EXPECTED}${NORMAL}\n"
  printf "* Actual: \n${RED}${ACTUAL}${NORMAL}\n"
  exit 1
fi

printf "${CYAN}## Testing webpack-dev-server build${NORMAL}\n"
npm run build-demo-wds || exit $?

EXPECTED="demo/build-1/stats.json
demo/build-2/copy.js
demo/build-2/deadbeef012345678901.main.js
demo/build-2/stats.json
demo/build-3/stats.json
demo/build-3/yo.js
demo/build-4/main.deadbeef012345678901.js
demo/build-4/nested/stats.json
demo/main.js
demo/webpack.config.js"
ACTUAL=$(find demo -type f | sort)

if [ "$EXPECTED" != "$ACTUAL" ]; then
  printf "${BOLD}${RED}Test failed${NORMAL}\n\n"
  printf "* Expected: \n${GREEN}${EXPECTED}${NORMAL}\n"
  printf "* Actual: \n${RED}${ACTUAL}${NORMAL}\n"
  exit 1
fi

printf "\n${GREEN}${BOLD}All tests passed${NORMAL}\n"
