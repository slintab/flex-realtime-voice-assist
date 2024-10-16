import React, { useCallback, useEffect, useState } from "react";
import { useFlexSelector } from "@twilio/flex-ui";
import { Box, Alert } from "@twilio-paste/core";

import VoiceAssistSuggestion from "./VoiceAssistSuggestion";
import VoiceAssistService from "../services/VoiceAssistService";

interface VoiceAssistTabProps {
  label: string;
  uniqueName: string;
}

export interface Suggestion {
  question: string;
  answer: string;
}

interface VoiceAssistResponse {
  message: {
    data: {
      transcript: string;
    };
  };
}

const VoiceAssistTab: React.FunctionComponent<VoiceAssistTabProps> = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const addSuggestion = useCallback((suggestion: Suggestion) => {
    setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
  }, []);

  const voiceAssistTabState = useFlexSelector(
    (state: any) => state.flex.view.componentViewStates.VoiceAssistTab
  );
  const isVoiceAssistEnabled = voiceAssistTabState?.isVisible || false;

  const messageHandler = ({ message }: VoiceAssistResponse) => {
    const parseOpenaiResponse = (response: string) => {
      const match = response.match(/```json([\s\S]*?)```/);
      if (match && match[1]) {
        return JSON.parse(match[1].trim());
      }
      return JSON.parse(response.trim());
    };

    try {
      const { question, answer } = parseOpenaiResponse(message.data.transcript);
      if (question && answer) {
        addSuggestion({ question, answer });
      }
    } catch (error) {
      console.error("Error parsing OpenAI response: ", message);
    }
  };

  useEffect(() => {
    const subscribe = async () => {
      const results = await VoiceAssistService.getResults();
      results?.on("messagePublished", messageHandler);
    };

    const unsubscribe = async () => {
      const results = await VoiceAssistService.getResults();
      results?.removeAllListeners("messagePublished");
    };

    isVoiceAssistEnabled ? subscribe() : unsubscribe();
  }, [isVoiceAssistEnabled]);

  return suggestions.length < 1 ? (
    <Box width="100vh">
      <Alert variant="neutral">
        Voice Assist suggestions will appear here.
      </Alert>
    </Box>
  ) : (
    <Box display="flex" flexDirection="column" padding="space40">
      {suggestions.map((item, index) => (
        <VoiceAssistSuggestion suggestion={item} key={index} />
      ))}
    </Box>
  );
};

export default VoiceAssistTab;
