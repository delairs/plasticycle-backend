#!/bin/sh
set -e

echo "Loading backend env from Vault using envconsul..."

exec envconsul -config=/vault/secrets/envconsul.hcl -- \
npm run start