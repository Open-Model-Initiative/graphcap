// SPDX-License-Identifier: Apache-2.0
/**
 * RabbitMQ connection and channel management
 *
 * Handles connection to RabbitMQ, channel creation, and exchange/queue setup.
 */

import * as amqplib from "amqplib";
import { env } from "../env";
import { EXCHANGES, QUEUES } from "../models/message";

// Connection state
let connection: amqplib.Connection | null = null;
let channel: amqplib.Channel | null = null;
let reconnectAttempts = 0;

/**
 * Create connection to RabbitMQ
 */
export async function connect(): Promise<amqplib.Connection> {
	if (connection) {
		return connection;
	}

	const host = env.RABBITMQ_HOST;
	const port = Number.parseInt(env.RABBITMQ_PORT);
	const username = env.RABBITMQ_USERNAME;
	const password = env.RABBITMQ_PASSWORD;
	const vhost = env.RABBITMQ_VHOST;
	const url = `amqp://${username}:${password}@${host}:${port}${vhost}`;

	try {
		console.info(`Connecting to RabbitMQ at ${host}:${port}...`);
		const conn = await amqplib.connect(url);
		connection = conn;

		// Reset reconnect attempts on successful connection
		reconnectAttempts = 0;

		// Handle connection errors and closure
		connection.on("error", handleConnectionError);
		connection.on("close", handleConnectionClose);

		console.info("Successfully connected to RabbitMQ");
		return connection;
	} catch (error) {
		console.error("Failed to connect to RabbitMQ:", error);
		await handleReconnect();
		throw error;
	}
}

/**
 * Get or create a channel
 */
export async function getChannel(): Promise<amqplib.Channel> {
	// Check if channel exists and is still open
	if (channel && channel.connection && typeof channel.assertExchange === 'function') {
		return channel;
	}

	try {
		// Ensure we have a connection
		const conn = await connect();
		// Create a new channel
		const ch = await conn.createChannel();
		channel = ch;

		// Handle channel errors and closure
		channel.on("error", (err) => {
			console.error("Channel error:", err);
			channel = null;
		});

		channel.on("close", () => {
			console.info("Channel closed");
			channel = null;
		});

		// Set up exchanges and queues
		if (channel) {
			await setupExchangesAndQueues(channel);
		}

		return channel;
	} catch (error) {
		console.error("Failed to create channel:", error);
		throw new Error(`Failed to create channel: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Setup exchanges and queues
 */
async function setupExchangesAndQueues(ch: amqplib.Channel): Promise<void> {
	// Declare exchanges
	await ch.assertExchange(EXCHANGES.CAPTION_DIRECT, "direct", {
		durable: true,
	});

	// Declare queues
	await ch.assertQueue(QUEUES.CAPTION_REQUEST, { durable: true });
	await ch.assertQueue(QUEUES.CAPTION_RESPONSE, { durable: true });

	// Bind queues to exchanges
	await ch.bindQueue(
		QUEUES.CAPTION_REQUEST,
		EXCHANGES.CAPTION_DIRECT,
		QUEUES.CAPTION_REQUEST,
	);
	await ch.bindQueue(
		QUEUES.CAPTION_RESPONSE,
		EXCHANGES.CAPTION_DIRECT,
		QUEUES.CAPTION_RESPONSE,
	);

	console.info("Exchanges and queues set up successfully");
}

/**
 * Handle connection error
 */
function handleConnectionError(error: Error): void {
	console.error("RabbitMQ connection error:", error);
	connection = null;
	channel = null;
}

/**
 * Handle connection close
 */
function handleConnectionClose(): void {
	console.info("RabbitMQ connection closed");
	connection = null;
	channel = null;

	// Try to reconnect
	void handleReconnect();
}

/**
 * Handle reconnection logic
 */
async function handleReconnect(): Promise<void> {
	const maxReconnectAttempts = Number.parseInt(
		env.RABBITMQ_MAX_RECONNECT_ATTEMPTS,
	);
	const reconnectInterval = Number.parseInt(env.RABBITMQ_RECONNECT_INTERVAL);

	if (reconnectAttempts >= maxReconnectAttempts) {
		console.error(
			`Maximum reconnection attempts (${maxReconnectAttempts}) reached. Giving up.`,
		);
		return;
	}

	reconnectAttempts++;

	console.info(
		`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${reconnectInterval}ms...`,
	);

	// Wait before reconnecting
	await new Promise((resolve) => setTimeout(resolve, reconnectInterval));

	try {
		await connect();
	} catch (error) {
		// Error is already logged in connect()
	}
}

/**
 * Close connection and channel
 */
export async function close(): Promise<void> {
	try {
		if (channel) {
			await channel.close();
			channel = null;
		}

		if (connection) {
			await connection.close();
			connection = null;
		}

		console.info("RabbitMQ connection and channel closed");
	} catch (error) {
		console.error("Error closing RabbitMQ connection:", error);
		throw error;
	}
}
