#! /bin/bash
source .bashrc &&
systemctl restart ReduxPlateApi.service &&
curl -X POST --data-urlencode 'payload={"text":"ReduxPlateApi Production CI successfully completed!"}' $REDUX_PLATE_SLACK_WEBHOOK_URL