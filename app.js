'use strict';

require('dotenv').config({ silent: true });
import { env } from 'utils';
const express = require('express'); //app server
const request = require('request'); //request module to make http requests
const bodyParser = require('body-parser'); // parser for post requests
const AssistantV1 = require('ibm-watson/assistant/v1'); // watson sdk, using only conversation service

// server  express config
const server = express();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

const wAssistant = new AssistantV1({
	version: env.version,
    username: env.username,
    password: env.password, 
	url: env.url
});

server.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] === 'paste your token here') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error when we try to validating your token.');
});

server.post('/webhook/', (req, res) => {
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
            context: ""
        };

        var payload = {
            workspace_id: env.workspace || "or paste it here"
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

const callMessage = (payload, res) => {
    let conversation_id = "";
    return wAssistant.message(payload, (err, responseMessage) => {
        console.log(responseMessage);
        contextID = responseMessage.context;

        if (err) return responseToRequest.send("Error");

        if (responseMessage.context != null) conversation_id = responseMessage.context.conversation_id;

        if (responseMessage != null && responseMessage.output != null) {
            let i = 0;
            while (i < responseMessage.output.text.length) {
                sendMessage(res, responseMessage.output.text[i++]);
            }
        }
    });
}

const sendMessage = (res, outputText) => {
    outputText = outputText.substring(0, 319);
    messageData = { text: outputText };

    let dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: env.token },
        method: 'POST',
        json: {
            recipient: { id: res },
            message: messageData,
        }
    };

    return request(dataPost, (error, response, body) => {
        if (error) {
            console.log('Error when we try to sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

server.listen(env.port, env.host, () => {
    console.log('Server running on port: %d', env.port);
});
