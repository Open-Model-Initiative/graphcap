/**
 * Message types and interfaces for GraphCap message broker
 */

import { z } from 'zod';

// Queue names
export const QUEUES = {
  CAPTION_REQUEST: 'caption.request',
  CAPTION_RESPONSE: 'caption.response'
} as const;

// Exchange names
export const EXCHANGES = {
  CAPTION_DIRECT: 'caption.direct'
} as const;

// Zod schemas for message validation
const baseMessageSchema = z.object({
  messageId: z.string().uuid(),
  type: z.string(),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
});

export const captionRequestSchema = baseMessageSchema.extend({
  type: z.literal('caption.request'),
  data: z.object({
    imagePath: z.string(),
    perspective: z.string(),
    options: z.object({
      provider: z.string().optional(),
      model: z.string().optional(),
    }).optional(),
  }),
});

export const captionResponseSchema = baseMessageSchema.extend({
  type: z.literal('caption.response'),
  correlationId: z.string().uuid(),
  data: z.object({
    imagePath: z.string(),
    perspective: z.string(),
    caption: z.string(),
    metadata: z.object({
      processingTime: z.number().optional(),
      provider: z.string().optional(),
      model: z.string().optional(),
    }).optional(),
  }),
});

// Union schema for all message types
export const messageSchema = z.discriminatedUnion('type', [
  captionRequestSchema,
  captionResponseSchema,
]);

// Infer types from schemas
export type BaseMessage = z.infer<typeof baseMessageSchema>;
export type CaptionRequestMessage = z.infer<typeof captionRequestSchema>;
export type CaptionResponseMessage = z.infer<typeof captionResponseSchema>;
export type Message = z.infer<typeof messageSchema>;

// Type guards for message types
export function isCaptionRequestMessage(message: Message): message is CaptionRequestMessage {
  return message.type === 'caption.request';
}

export function isCaptionResponseMessage(message: Message): message is CaptionResponseMessage {
  return message.type === 'caption.response';
} 