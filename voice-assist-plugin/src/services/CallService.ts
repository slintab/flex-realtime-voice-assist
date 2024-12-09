import * as Flex from "@twilio/flex-ui";
import axios from "axios";

const FUNCTIONS_URL = process.env.FLEX_APP_FUNCTIONS_URL;

class CallService {
  url: string | undefined;
  manager: Flex.Manager;

  constructor() {
    this.url = FUNCTIONS_URL;
    this.manager = Flex.Manager.getInstance();
  }

  async startStream(callSid: string) {
    if (!this.url) {
      console.error("Functions URL is not set.");
      return false;
    }

    const url = `${this.url}/stream`;
    const token =
      this.manager.store.getState()?.flex?.session?.ssoTokenPayload?.token;

    if (!token) {
      console.error("SSO token is not available.");
      return false;
    }

    const payload = {
      action: "start",
      callSid,
      Token: token,
    };

    try {
      return await axios.post(url, payload);
    } catch (error) {
      console.error(`Error making request: ${error}`);
      return false;
    }
  }

  async endStream(callSid: string) {
    if (!this.url) {
      console.error("Functions URL is not set.");
      return false;
    }

    const url = `${this.url}/stream`;
    const token =
      this.manager.store.getState()?.flex?.session?.ssoTokenPayload?.token;

    if (!token) {
      console.error("SSO token is not available.");
      return false;
    }

    const payload = {
      action: "stop",
      callSid,
      Token: token,
    };

    try {
      return await axios.post(url, payload);
    } catch (error) {
      console.error(`Error making request: ${error}`);
      return false;
    }
  }
}

export default CallService;
