import { Actions } from "@twilio/flex-ui";
import VoiceAssistService from "../services/VoiceAssistService";

interface StopVoiceAssistActionPayload {
  callSid: string;
}

const handleStopVoiceAssistAction = async (
  payload: StopVoiceAssistActionPayload
) => {
  const { callSid } = payload;
  const voiceAssist = await VoiceAssistService.stop(callSid);

  if (!voiceAssist) {
    throw `Error stopping voice assist for: ${callSid}.`;
  }

  Actions.invokeAction("SetComponentState", {
    name: "VoiceAssistTab",
    state: { isVisible: false },
  });
};

export default handleStopVoiceAssistAction;
