import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";
import { CustomizationProvider } from "@twilio-paste/core/customization";

import { registerVoiceAssistActions } from "./actions";
import { registerVoiceAssistComponents } from "./components";

const PLUGIN_NAME = "VoiceAssistPlugin";

export default class VoiceAssistPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    flex.setProviders({ PasteThemeProvider: CustomizationProvider });

    registerVoiceAssistActions();
    registerVoiceAssistComponents();
  }
}
