import { Actions } from "@twilio/flex-ui";
import handleStartVoiceAssistAction from "./StartVoiceAssist";
import handleStopVoiceAssistAction from "./StopVoiceAssist";

export const registerVoiceAssistActions = (): void => {
  Actions.registerAction("StartVoiceAssist", handleStartVoiceAssistAction);
  Actions.registerAction("StopVoiceAssist", handleStopVoiceAssistAction);
};
