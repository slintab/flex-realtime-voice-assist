import { SyncClient, SyncStream } from 'twilio-sync';

const INSTRUCTIONS =
	'You are a helpful assistant, who is listening to a conversation between a customer and a contact center agent. Your task is to assist the agent during the conversation, by suggesting answers to the questions asked by the customer. Be friendly, but professional. Craft the responses in a manner suitable for reading to the customer. Return the answer in JSON, using the schema {question, answer}';

export interface Env {
	OPENAI_API_KEY: string;
	SYNC_TOKEN_URL: string;
	SYNC_TOKEN_IDENTITY: string;
}

interface TwilioMediaMessage {
	event: 'media';
	media: {
		payload: string;
	};
}

interface TwilioStopMessage {
	event: 'stop';
	streamSid: string;
	stop: {
		callSid: string;
	};
}

type TwilioMessage = TwilioMediaMessage | TwilioStopMessage;

interface OpenaiResponseTextMessage {
	type: 'response.text.done';
	text: string;
}

interface OpenaiSessionCreatedMessage {
	type: 'session.created';
}

type OpenaiMessage = OpenaiResponseTextMessage | OpenaiSessionCreatedMessage;

interface SyncTokenResponse {
	token: string;
}

async function createOpenaiWs(env: Env) {
	const resp = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
		headers: {
			Upgrade: 'websocket',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
			'OpenAI-Beta': 'realtime=v1',
		},
	});
	const openaiWs = resp.webSocket;
	if (!openaiWs) {
		throw new Error('Unable to connect to OpenAI');
	}
	return openaiWs;
}

async function createSyncClient(tokenUrl: string, identity: string) {
	const url = `${tokenUrl}?identity=${identity}`;
	const response = await fetch(url);
	const data = await response.json();

	return new SyncClient((data as SyncTokenResponse).token);
}

async function createSyncStream(client: SyncClient, name: string) {
	return client.stream({
		id: name,
		mode: 'open_or_create',
		ttl: 3600,
	});
}

function handleOpenaiEvents(openaiWs: WebSocket, syncStream: SyncStream) {
	openaiWs.addEventListener('message', async (event) => {
		const message: OpenaiMessage = JSON.parse(event.data as string);
		switch (message.type) {
			case 'response.text.done':
				await syncStream.publishMessage({ transcript: message.text });
				break;
			case 'session.created':
				const sessionUpdate = {
					type: 'session.update',
					session: {
						turn_detection: { type: 'server_vad', threshold: 0.2 },
						modalities: ['text'],
						temperature: 0.8,
						input_audio_format: 'g711_ulaw',
						instructions: INSTRUCTIONS,
					},
				};
				openaiWs.send(JSON.stringify(sessionUpdate));
				break;
		}
	});
}

function handleTwilioEvents(twilioWs: WebSocket, openaiWs: WebSocket, syncStream: SyncStream) {
	twilioWs.addEventListener('message', async (event) => {
		const message: TwilioMessage = JSON.parse(event.data as string);
		switch (message.event) {
			case 'media':
				if (openaiWs.readyState === WebSocket.OPEN) {
					const audioAppend = {
						type: 'input_audio_buffer.append',
						audio: message.media.payload,
					};
					openaiWs.send(JSON.stringify(audioAppend));
				}
				break;
			case 'stop':
				await syncStream.removeStream();
				break;
		}
	});
}

async function callHandler(twilioWs: WebSocket, env: Env, callSid: string) {
	const openaiWs = await createOpenaiWs(env);
	const sync = await createSyncClient(env.SYNC_TOKEN_URL, env.SYNC_TOKEN_IDENTITY);
	const syncStream = await createSyncStream(sync, 'FLEX_ASSIST_' + callSid);

	twilioWs.accept();
	openaiWs.accept();

	handleOpenaiEvents(openaiWs, syncStream);
	handleTwilioEvents(twilioWs, openaiWs, syncStream);
}

async function websocketHandler(request: Request, env: Env, callSid: string) {
	const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return new Response('Expected Upgrade: websocket', { status: 426 });
	}

	const [client, server] = Object.values(new WebSocketPair());

	await callHandler(server, env, callSid);

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const [path, callSid] = url.pathname.split('/').filter((part) => part !== '');

		if (!(path === 'ws' && callSid)) {
			return new Response('Not found', { status: 404 });
		}

		return websocketHandler(request, env, callSid);
	},
} satisfies ExportedHandler<Env>;
