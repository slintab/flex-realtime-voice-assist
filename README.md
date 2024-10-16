# Twilio Flex: Real-time Voice Assist

This repository contains the code of a [Twilio Flex](https://www.twilio.com/flex) plugin for displaying real-time suggestions for agents during voice calls. The plugin uses the OpenAI [Realtime API](https://openai.com/index/introducing-the-realtime-api/) to provide suggestions to customer questions for aggents in real-time.


## Table of contents

* [Demo](#demo)
* [Components](#components)
* [Setup](#setup)
* [Maintainer](#maintainer)


## Demo

![Demo](demo.png?raw=true)


## Components

The solution consists of the following components:
- **Twilio Flex (plugin)**: responsible for initiating the streaming of the call audio and displaying the suggested AI-generated responses.
- **Twilio Functions**: act as middleware for interacting with Twilio APIs from Flex, and for obtaining a token for connecting to Twilio Sync.
- **Twilio Programmable Voice**: service for handing calls, and for streaming call audio over websocket.
- **Cloudflare Worker**: used as the websocket destination for call streams. After receiving the audio stream from Twilio, the Worker forwards it to OpenAI over websocket using the Realtime API. The Worker then listens for responses from OpenAI and publishes them to a Twilio Sync stream. The prompt used for generating responses can be updated by setting the `INSTRUCTION` variable in the Worker.
- **OpenAI**: service for generating response suggestions.
- **Twilio Sync**: pub/sub service for sending the response suggestions from the Cloudflare Worker to Flex.

![Diagram](diagram.png?raw=true)


## Setup

1. **Create a Sync Service:** 
   1. This can be done using the Twilio Console, under *Sync > Services > Create new Sync service*.
2. **Deploy Twilio Functions:**
   1. Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit).
   2. Navigate to the functions directory: `cd voice-assist-functions`
   3. Rename `.env.example` to `.env`, and set the values of the environment variables as follows:
      - `ACCOUNT_SID`: your Twilio account SID
      - `AUTH_TOKEN`: your Twilio auth token 
      - `API_KEY`: your Twilio API key
      - `API_SECRET`: your Twilio API secret
      - `SYNC_SERVICE_SID`: SID of the Sync service from step 1.
      - `SYNC_TOKEN_IDENTITY`: hard-to-guess, arbitrary string. Used as the Sync access token's identity and for accessing the function for fetching the Sync token.
   4. Deploy the functions using `npm run deploy`.
3. **Deploy Cloudflare Worker:**
   1. Navigate to the worker directory: `cd voice-assist-worker`.
   2. Install dependencies via `npm install`.
   3. Deploy the Worker using `npx wrangler deploy`.
   4. Add the following [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) to your worker:
      - `OPENAI_API_KEY`: your OpenAI API key.
      - `SYNC_TOKEN_IDENTITY`: identity string from step 2.
      - `SYNC_TOKEN_URL`: URL of the deployed `/token` Twilio function from step 2.
4. **Re-deploy Twilio Functions:**
   1. Navigate to the functions directory: `cd voice-assist-functions`
   2. Update the `.env` file and set `STREAM_URL` to the websocket URL of the Cloudflare worker from step 3.
   3. Re-deploy the functions using `npm run deploy`.
5. **Deploy Twilio Flex Plugin:**
   1. Install the [Flex Plugins CLI](https://www.twilio.com/docs/flex/developer/plugins/cli).
   2. Navigate to the plugin directory: `cd voice-assist--plugin`.
   3. Rename `.env.example` to `.env`, and set the values of environment variables as follows: 
      - `FLEX_APP_FUNCTIONS_URL`: base URL of Twilio functions from step 2.
      - `FLEX_APP_SYNC_TOKEN_IDENTITY`: identity string from step 2.
   4. Deploy the plugin using the `twilio flex:plugins:deploy` command.


## Maintainer

Thanks for reading this far!
If you have any questions, do not hesitate to reach out at `hello@slintab.dev`