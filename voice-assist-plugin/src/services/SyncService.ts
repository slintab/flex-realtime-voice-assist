import * as Flex from "@twilio/flex-ui";
import { SyncClient } from "twilio-sync";
import axios from "axios";

const FUNCTIONS_URL = process.env.FLEX_APP_FUNCTIONS_URL;
const SYNC_TOKEN_IDENTITY = process.env.FLEX_APP_SYNC_TOKEN_IDENTITY;

class SyncService {
  url: string | undefined;
  identity: string | undefined;
  manager: Flex.Manager;
  client: SyncClient | null;

  constructor() {
    this.url = FUNCTIONS_URL;
    this.identity = SYNC_TOKEN_IDENTITY;
    this.manager = Flex.Manager.getInstance();
    this.client = null;
  }

  async getToken() {
    if (!this.url || !this.identity) {
      console.error("Functions URL or Sync Token Identity is not set.");
      return false;
    }

    const url = `${this.url}/token?identity=${this.identity}`;

    try {
      const resp = await axios.get(url);
      return resp.data.token;
    } catch (error) {
      console.error(`Error making request: ${error}} `);
      return false;
    }
  }

  async getSyncClient() {
    const token = await this.getToken();

    if (token) {
      this.client = new SyncClient(token);
    }
  }

  async getStream(name: string) {
    try {
      if (!this.client) {
        await this.getSyncClient();
      }

      if (!this.client) {
        console.error("Sync client not initialized.");
        return false;
      }

      return await this.client.stream({
        id: name,
        mode: "open_or_create",
        ttl: 3600,
      });
    } catch (error) {
      console.error("Error fetching stream", error);
      return false;
    }
  }
}

export default SyncService;
