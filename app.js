var express = require('express'); //app server
var request = require('request'); //request module to make http requests
var bodyParser = require('body-parser'); // parser for post requests
var watson = require('watson-developer-cloud/conversation/v1'); // using only conversation service

// server config
const token = process.env.TOKEN || "Or paste your FB token here";
const host = process.env.VCAP_APP_HOST || 'localhost';
const port = process.env.VCAP_APP_PORT || 3000;

var app = express();
const contextID = "";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var conversation = watson.conversation({
    url: 'https://gateway.watsonplatform.net/conversation/api',
    username: process.env.CONVERSATION_USERNAME || 'Or paste here your username',
    password: process.env.CONVERSATION_PASSWORD || 'Or paste here your password',
    version: 'v1',
    version_date: '2017-05-26'
});

const workspace = process.env.WORKSPACE_ID || 'Or paste your workspace_id here';

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Paste your FB token here') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error when we try to validating your token.');
});

app.post('/webhook/', function (req, res) {
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
	conversation.message(payload, function (err, convResults) {
		console.log(convResults);
		contextid = convResults.context;
		
        if (err) {
            return responseToRequest.send("Error");
        }
		
		if (convResults.context != null)
    	   conversation_id = convResults.context.conversation_id;
        if (convResults != null && convResults.output != null) {
			var i = 0;
			while(i < convResults.output.text.length) {
				sendMessage(res, convResults.output.text[i++]);
			}
		}
            
    });
}

function sendMessage(res, text_) {
	text_ = text_.substring(0, 319);
	messageData = {	text: text_ };
	
	var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: res },
            message: messageData,
        }
    };

    request(dataPost, function (error, response, body) {
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
