// SPDX-License-Identifier: Apache-2.0
/**
 * Message handling service for publishing and consuming messages
 */

import { randomUUID } from "node:crypto";
import type * as amqplib from "amqplib";
import { EXCHANGES, type Message, messageSchema } from "../models/message";
import { getChannel } from "./broker";

// Type for message handler callback
export type MessageHandler = (message: Message) => Promise<void>;

// Store for consumer tags
const consumerTags = new Map<string, string>();

/**
 * Publish a message to a specific queue
 */
export async function publishMessage(
	routingKey: string,
	message: Omit<Message, "messageId" | "timestamp">,
): Promise<string> {
	try {
		const channel = await getChannel();

		// Generate message ID and add timestamp
		const messageId = randomUUID();
		const completeMessage: Message = {
			...(message as unknown as Message),
			messageId,
			timestamp: new Date().toISOString(),
		};
		
		// Validate the message against the schema
		const validationResult = messageSchema.safeParse(completeMessage);
		if (!validationResult.success) {
			throw new Error(`Invalid message format: ${validationResult.error.message}`);
		}

		// Publish to the exchange
		const buffer = Buffer.from(JSON.stringify(validationResult.data));
		channel.publish(EXCHANGES.CAPTION_DIRECT, routingKey, buffer, {
			contentType: "application/json",
			messageId,
			persistent: true,
		});

		console.info(`Published message ${messageId} to ${routingKey}`);
		return messageId;
	} catch (error) {
		console.error("Error publishing message:", error);
		throw new Error(
			`Failed to publish message: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Get a single message from a queue without consuming
 */
export async function getMessage(
	queueName: string,
	autoAck = false,
): Promise<{ 
	message: Message; 
	deliveryTag: number; 
} | null> {
	try {
		const channel = await getChannel();
		const msg = await channel.get(queueName, { noAck: autoAck });

		if (!msg) {
			return null;
		}

		// Parse message content
		const content = msg.content.toString();
		
		try {
			const parsedData = JSON.parse(content);
			
			// Validate the message
			const validationResult = messageSchema.safeParse(parsedData);
			if (!validationResult.success) {
				console.error('Invalid message format:', validationResult.error);
				
				// Reject invalid messages
				await channel.nack(msg, false, false);
				throw new Error(`Invalid message format: ${validationResult.error.message}`);
			}
			
			return {
				message: validationResult.data,
				deliveryTag: msg.fields.deliveryTag
			};
		} catch (error) {
			// If parsing or validation fails, reject the message
			if (!autoAck) {
				await channel.nack(msg, false, false);
			}
			throw error;
		}
	} catch (error) {
		console.error(`Error getting message from ${queueName}:`, error);
		throw new Error(
			`Failed to get message: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Acknowledge a message
 */
export async function acknowledgeMessage(deliveryTag: number): Promise<void> {
	try {
		const channel = await getChannel();
		
		// Create a message-like object with deliveryTag that the ack method can use
		const msgLike = { fields: { deliveryTag } };
		await channel.ack(msgLike as unknown as amqplib.Message);
		
		console.info(`Acknowledged message with delivery tag ${deliveryTag}`);
	} catch (error) {
		console.error("Error acknowledging message:", error);
		throw new Error(
			`Failed to acknowledge message: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Reject a message
 */
export async function rejectMessage(
	deliveryTag: number,
	requeue = true,
): Promise<void> {
	try {
		const channel = await getChannel();
		
		// Create a message-like object with deliveryTag that the nack method can use
		const msgLike = { fields: { deliveryTag } };
		await channel.nack(msgLike as unknown as amqplib.Message, false, requeue);
		
		console.info(`Rejected message with delivery tag ${deliveryTag}, requeue: ${requeue}`);
	} catch (error) {
		console.error("Error rejecting message:", error);
		throw new Error(
			`Failed to reject message: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Consume messages from a queue
 */
export async function consumeMessages(
	queueName: string,
	handler: MessageHandler,
): Promise<string> {
	try {
		// Check if we already have a consumer for this queue
		if (consumerTags.has(queueName)) {
			const tag = consumerTags.get(queueName);
			if (tag) {
				return tag;
			}
		}

		const channel = await getChannel();
		const { consumerTag } = await channel.consume(queueName, async (msg) => {
			if (!msg) {
				console.warn("Received null message, queue might have been deleted");
				return;
			}

			try {
				// Parse message content
				const content = msg.content.toString();
				const parsedData = JSON.parse(content);
				
				// Validate message against schema
				const validationResult = messageSchema.safeParse(parsedData);
				if (!validationResult.success) {
					console.error('Invalid message format:', validationResult.error);
					// Reject invalid messages (don't requeue)
					channel.nack(msg, false, false);
					return;
				}

				// Process valid message
				await handler(validationResult.data);

				// Acknowledge message
				channel.ack(msg);
			} catch (error) {
				console.error(`Error processing message from ${queueName}:`, error);
				// Nack with requeue in case of processing error
				channel.nack(msg, false, true);
			}
		});

		// Store consumer tag
		consumerTags.set(queueName, consumerTag);
		console.info(`Started consuming from ${queueName} with tag ${consumerTag}`);

		return consumerTag;
	} catch (error) {
		console.error(`Error consuming messages from ${queueName}:`, error);
		throw new Error(
			`Failed to consume messages: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Cancel message consumption
 */
export async function cancelConsumption(queueName: string): Promise<boolean> {
	try {
		const consumerTag = consumerTags.get(queueName);
		if (!consumerTag) {
			console.warn(`No active consumer for queue ${queueName}`);
			return false;
		}

		const channel = await getChannel();
		await channel.cancel(consumerTag);

		// Remove consumer tag
		consumerTags.delete(queueName);
		console.info(
			`Cancelled consumption from ${queueName} with tag ${consumerTag}`,
		);

		return true;
	} catch (error) {
		console.error(`Error cancelling consumption from ${queueName}:`, error);
		throw new Error(
			`Failed to cancel consumption: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
