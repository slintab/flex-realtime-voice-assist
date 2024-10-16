import * as Flex from "@twilio/flex-ui";
import VoiceAssistTab from "./VoiceAssistTab";
import VoiceAssistButton from "./VoiceAssistButton";

export const registerVoiceAssistComponents = () => {
  Flex.TaskCanvasTabs.Content.add(
    <VoiceAssistTab
      key="voice-assist-tab"
      label="Voice Assist"
      uniqueName="VoiceAssistTab"
    />
  );
  Flex.CallCanvasActions.Content.add(
    <VoiceAssistButton key="voice-assist-action" />
  );
};
