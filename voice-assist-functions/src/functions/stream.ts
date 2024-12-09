import "@twilio-labs/serverless-runtime-types";
import { Twilio as ITwilio, twiml as Twiml } from "twilio";
import {
  HandlerFn,
  Callback,
  functionValidator as TokenValidator,
} from "twilio-flex-token-validator";

const { createResponse, createError } = require(Runtime.getFunctions()[
  "common/utils"
].path);

type MyEvent = {
  Token: string;
  TokenResult?: object;
  action?: string;
  callSid?: string;
};

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  STREAM_URL?: string;
  getTwilioClient?: () => ITwilio;
};

async function startCallStream(client: ITwilio, callSid: string, url: string) {
  await client.calls(callSid).streams.create({
    name: "assist_" + callSid,
    url: `${url}/ws/${callSid}`,
  });
}

async function stopCallStream(client: ITwilio, callSid: string) {
  await client
    .calls(callSid)
    .streams("assist_" + callSid)
    .update({ status: "stopped" });
}

export const handler: HandlerFn = TokenValidator(async function (
  context: MyContext,
  event: MyEvent,
  callback: Callback
) {
  const { callSid, action } = event;
  const { STREAM_URL, getTwilioClient } = context;

  if (!(callSid && action)) {
    return createError(new Error("Missing parameters"), 400, callback);
  }

  if (!(STREAM_URL && getTwilioClient)) {
    return createError(new Error("Internal error"), 500, callback);
  }

  try {
    const twilioClient = getTwilioClient();

    if (action === "start") {
      await startCallStream(twilioClient, callSid, STREAM_URL);
    }

    if (action === "stop") {
      await stopCallStream(twilioClient, callSid);
    }

    return createResponse({ result: true }, callback);
  } catch (err) {
    return createError(err, 500, callback);
  }
});
