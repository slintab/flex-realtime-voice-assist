import "@twilio-labs/serverless-runtime-types";
import { Twilio as ITwilio } from "twilio";
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
  callSid?: string;
};

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  getTwilioClient?: () => ITwilio;
};

async function stopCallStream(client: ITwilio, callSid: string) {
  await client.calls(callSid).streams(callSid).update({ status: "stopped" });
}

export const handler: HandlerFn = TokenValidator(async function (
  context: MyContext,
  event: MyEvent,
  callback: Callback
) {
  const { callSid } = event;
  const { getTwilioClient } = context;

  if (!callSid) {
    return createError(new Error("Missing parameters"), 400, callback);
  }

  if (!getTwilioClient) {
    return createError(new Error("Internal error"), 500, callback);
  }

  try {
    const twilioClient = getTwilioClient();

    await stopCallStream(twilioClient, callSid);

    return createResponse({ result: true }, callback);
  } catch (err) {
    return createError(new Error("Internal error"), 500, callback);
  }
});
