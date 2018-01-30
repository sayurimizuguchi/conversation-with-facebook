'use strict';

require('dotenv').config({ silent: true });

const express = require('express'); //app server
var request = require('request'); //request module to make http requests
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk, using only conversation service

// server  express config
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const host = process.env.VCAP_APP_HOST || 'localhost'; //vcap for bluemix/cloud
const port = process.env.VCAP_APP_PORT || 3000; //vcap port for bluemix/cloud

//facebook token generated
const token = process.env.TOKEN || "Or paste your FB token here";

//Workspace from your Conversation Service
const workspace = process.env.WORKSPACE_ID || 'Or paste your workspace_id here';

var conversation = new Conversation({
    url: 'https://gateway.watsonplatform.net/conversation/api',
    username: process.env.CONVERSATION_USERNAME || 'Or paste here your username',
    password: process.env.CONVERSATION_PASSWORD || 'Or paste here your password',
    version: 'v1',
    version_date: '2017-05-26'
});

app.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] === 'paste your token here') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error when we try to validating your token.');
});

var contextID = "";
app.post('/webhook/', (req, res) => {
    var text = null;
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        res = event.res.id;

        if (event.message && event.message.text) {
            text = event.message.text;
        } else if (event.postback && !text) {
            text = event.postback.payload;
        } else {
            break;
        }    

        var params = {
            input: text,
            context: contextID
        };

        var payload = {
            workspace_id: workspace
        };

        if (params) {
            if (params.input) {
                params.input = params.input.replace("\n", "");
                payload.input = { "text": params.input };
            }
            if (params.context) {
                payload.context = params.context;
            }
        }
        callMessage(payload, res);
    }
    res.sendStatus(200);
});

function callMessage(payload, res) {
    var conversation_id = "";
    conversation.message(payload, (err, responseMessage) => {
        console.log(responseMessage);
        contextID = responseMessage.context;

        if (err) return responseToRequest.send("Error");

        if (responseMessage.context != null) conversation_id = responseMessage.context.conversation_id;

        if (responseMessage != null && responseMessage.output != null) {
            var i = 0;
            while (i < responseMessage.output.text.length) {
                sendMessage(res, responseMessage.output.text[i++]);
            }
        }
    });
}

function sendMessage(res, outputText) {
    outputText = outputText.substring(0, 319);
    messageData = { text: outputText };

    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: res },
            message: messageData,
        }
    };

    request(dataPost, (error, response, body) => {
        if (error) {
            console.log('Error when we try to sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.listen(port, host, function() {
    console.log('Server running on port: %d', port);
});
