import React from "react";
import { Avatar, Box, Text, Separator } from "@twilio-paste/core";
import { Suggestion } from "./VoiceAssistTab";

interface VoiceAssistSuggestionProps {
  suggestion: Suggestion;
}

const VoiceAssistSuggestion: React.FunctionComponent<
  VoiceAssistSuggestionProps
> = ({ suggestion }) => {
  const { question, answer } = suggestion;

  return (
    <Box display="flex" flexDirection="column">
      <Text as="p" fontWeight="fontWeightMedium" fontSize="fontSize30">
        {question}
      </Text>
      <Text as="p" fontSize="fontSize30">
        {answer}
      </Text>
      <Separator orientation="horizontal" verticalSpacing="space40" />
    </Box>
  );
};

export default VoiceAssistSuggestion;
