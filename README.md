# conversation-with-facebook

Basic example of how to Integrate Watson Assistant (Formerly Conversation) with Facebook Messenger.

### What you need:
  - Facebook account
  - Facebook [developer](https://developers.facebook.com/apps/) tools
  - [IBM Cloud](https://www.ibm.com/cloud) account 
  - Deploy at IBM Cloud (Free/lite option).
  
### Steps for repo:

#### 1. Clone the repo using `git clone <copy url repo>`
#### 2. Deploy at IBM Cloud using lite plan (free):

  [![Deploy to IBM Cloud](https://cloud.ibm.com/devops/setup/deploy/button.png)](https://cloud.ibm.com/devops/setup/deploy?repository=https://github.com/sayurimizuguchi/conversation-with-facebook&branch=master)

#### 3. Edit the `.env.example` with your Assistant Credentials and token information :exclamation:
#### 4. Rename the `.env-example` to `.env` and insert your credentials. :exclamation:


### Steps for Facebook: 
- You might check this [Link](https://developer.ibm.com/tutorials/fb-messenger-wcs-botkit/) to facilitate configuring your Facebook and webhook. Start it on `Creating facebook page`. :nerd_face:
- Sent a message for your page and have fun! :heart_eyes:

#### Note: When you are at step `New Page Subscription` on facebook page, remember to put the URL of your deployment on IBM Cloud

### Useful links
- Watson Assistant [API docs](https://cloud.ibm.com/apidocs/assistant?code=node#introduction).
- Facebook config [tutorial[(https://developer.ibm.com/tutorials/fb-messenger-wcs-botkit/).
