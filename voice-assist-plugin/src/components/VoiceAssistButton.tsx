import React, { useState } from "react";
import { ITask, withTaskContext, IconButton, Actions } from "@twilio/flex-ui";

interface VoiceAssistButtonProps {
  task: ITask;
}

const VoiceAssistButton: React.FunctionComponent<VoiceAssistButtonProps> = ({
  task,
}) => {
  const [isVoiceAssistOn, setVoiceAssistOn] = useState(false);
  const [isVoiceAssistEnabled, setVoiceAssistEnabled] = useState(true);

  const toggleVoiceAssistEnabled = () => {
    setVoiceAssistEnabled(!isVoiceAssistEnabled);
  };

  const toggleVoiceAssist = () => {
    setVoiceAssistOn(!isVoiceAssistOn);
  };

  const handleStartAssist = async () => {
    toggleVoiceAssist();
    try {
      const callSid = task.attributes.conference?.participants?.customer;
      const taskSid = task.taskSid;

      if (!callSid) {
        throw new Error(`Missing callSid from: ${taskSid}.`);
      }
      await Actions.invokeAction("StartVoiceAssist", {
        callSid,
      });
    } catch (error) {
      console.error("Error starting voice assist", error);
      toggleVoiceAssistEnabled();
    }
  };

  const handleStopAssist = async () => {
    toggleVoiceAssist();
    try {
      const callSid = task.attributes.conference?.participants?.customer;
      await Actions.invokeAction("StopVoiceAssist", { callSid });
    } catch (error) {
      console.error("Error stopping assist", error);
      toggleVoiceAssist();
    }
  };

  return (
    <IconButton
      variant={isVoiceAssistOn ? "destructive" : "secondary"}
      icon="Voice"
      key="voice-assist"
      title="Voice Assist"
      disabled={task.status === "wrapping" || !isVoiceAssistEnabled}
      onClick={isVoiceAssistOn ? handleStopAssist : handleStartAssist}
    ></IconButton>
  );
};

export default withTaskContext(VoiceAssistButton);
