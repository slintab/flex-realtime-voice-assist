import { Actions } from "@twilio/flex-ui";
import VoiceAssistService from "../services/VoiceAssistService";

interface StartVoiceAssistActionPayload {
  callSid: string;
  conferenceSid: string;
  taskSid: string;
}

const handleStartVoiceAssistAction = async (
  payload: StartVoiceAssistActionPayload
) => {
  const { callSid } = payload;

  const voiceAssist = await VoiceAssistService.start(callSid);

  if (!voiceAssist) {
    throw `Error starting voice assist for: ${callSid}.`;
  }

  Actions.invokeAction("SetComponentState", {
    name: "VoiceAssistTab",
    state: { [callSid]: { enabled: true } },
  });
};

export default handleStartVoiceAssistAction;
