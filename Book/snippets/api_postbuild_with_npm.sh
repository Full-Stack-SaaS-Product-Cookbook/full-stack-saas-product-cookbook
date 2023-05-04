#! /bin/bash
. ~/.profile &&
cd /var/www/ReduxPlateApi/Microservices/reduxplate-code-generator/ &&
npm install &&
systemctl restart ReduxPlateApi.service &&
curl -X POST -H 'Content-type: application/json' --data '{"text":"ReduxPlateApi Production CI successfully completed!"}' https://hooks.slack.com/ABCDEFG/HIJKLNMPO