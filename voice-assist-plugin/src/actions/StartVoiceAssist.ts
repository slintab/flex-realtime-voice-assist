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
  const { callSid, conferenceSid, taskSid } = payload;

  const voiceAssist = await VoiceAssistService.start(
    callSid,
    conferenceSid,
    taskSid
  );

  if (!voiceAssist) {
    throw `Error starting voice assist for: ${callSid}.`;
  }

  Actions.invokeAction("SetComponentState", {
    name: "VoiceAssistTab",
    state: { isVisible: true },
  });
};

export default handleStartVoiceAssistAction;
