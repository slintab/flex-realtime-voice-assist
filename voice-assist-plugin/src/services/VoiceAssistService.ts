import * as Flex from "@twilio/flex-ui";
import SyncService from "./SyncService";
import CallService from "./CallService";

const FUNCTIONS_URL = process.env.FLEX_APP_FUNCTIONS_URL;

class VoiceAssistService {
  private static _instance: VoiceAssistService;

  url: string | undefined;
  manager: Flex.Manager;
  sync: SyncService;
  call: CallService;
  stream: any;

  private constructor() {
    this.url = FUNCTIONS_URL;
    this.manager = Flex.Manager.getInstance();
    this.sync = new SyncService();
    this.call = new CallService();
  }

  static getInstance(): VoiceAssistService {
    if (!VoiceAssistService._instance) {
      VoiceAssistService._instance = new VoiceAssistService();
    }
    return VoiceAssistService._instance;
  }

  async start(callSid: string) {
    const syncStream = await this.sync.getStream("FLEX_ASSIST_" + callSid);
    if (!syncStream) {
      console.error("Failed to fetch sync stream.");
      return;
    }

    const callStream = await this.call.startStream(callSid);
    if (!callStream) {
      console.error("Failed to fetch call stream.");
      return;
    }

    this.stream = syncStream;
    return syncStream;
  }

  async stop(callSid: string) {
    const callStream = await this.call.endStream(callSid);
    if (!callStream) {
      console.error("Failed to fetch call stream.");
      return;
    }

    return callStream;
  }

  getResults() {
    return this.stream;
  }
}

export default VoiceAssistService.getInstance();
