#!/usr/bin/env bash

# Clean any old updates made manually
git clean -f
git reset --hard HEAD
git pull
perl -pi -e 's/pbs-ui\///' app/config.js
cp /etc/pbs/uienv.js ./app/env.js
service nginx restart