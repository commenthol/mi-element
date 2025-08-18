#!/usr/bin/env bash

CWD=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$CWD"

# change version on all packages of the workspace including the root
function version {
	npx versionn $@
	pnpm -r exec -- versionn $@
}

function help {
	# declare -F does not works in zsh!
	declare -F | sed -e 's/declare -f /    /; /    _[a-z]/d'
}

if test -z "$1"; then
	help
else
	$1 ${*:2}
fi
