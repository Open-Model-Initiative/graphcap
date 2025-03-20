/**
 * Simple test client for the GraphCap Message Broker
 * 
 * This script demonstrates a basic end-to-end flow using the message broker:
 * 1. Publish a caption request message
 * 2. Consume the message from the request queue
 * 3. Process it (mock processing)
 * 4. Publish a response
 * 5. Verify the response is received
 */

import { randomUUID } from 'node:crypto';
import { QUEUES } from '../src/models/message';
import { close, getChannel } from '../src/services/broker';

/**
 * Sleep for the specified number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Run the test flow
 */
async function runTest() {
  console.log('🚀 Starting GraphCap Message Broker test client...');
  
  try {
    // Get a channel
    const channel = await getChannel();
    console.log('✅ Connected to RabbitMQ');
    
    // Create a unique message ID
    const messageId = randomUUID();
    const imagePath = '/workspace/datasets/local/test-image.jpg';
    const perspective = 'graph_caption';
    
    console.log(`📤 Publishing caption request for image: ${imagePath}`);
    
    // Publish a caption request message
    const requestMessage = {
      messageId,
      type: 'caption.request',
      timestamp: new Date().toISOString(),
      data: {
        imagePath,
        perspective,
        options: {
          provider: 'test',
          model: 'test-model'
        }
      }
    };
    
    // Publish the request message
    const content = Buffer.from(JSON.stringify(requestMessage));
    channel.publish('caption.direct', QUEUES.CAPTION_REQUEST, content, {
      contentType: 'application/json',
      messageId,
      persistent: true
    });
    
    console.log('✅ Request message published');
    console.log('⏳ Waiting for message...');
    
    // Consume messages from the request queue
    await channel.consume(QUEUES.CAPTION_REQUEST, async (msg) => {
      if (!msg) {
        console.log('❌ Received null message');
        return;
      }
      
      // Parse the message
      const requestContent = JSON.parse(msg.content.toString());
      console.log('📥 Received request message:', requestContent);
      
      // Acknowledge the message
      channel.ack(msg);
      console.log('✓ Acknowledged request message');
      
      // Simulate processing (generate a caption)
      console.log('⏳ Simulating caption generation...');
      await sleep(2000);
      
      // Create a response message
      const responseMessage = {
        messageId: randomUUID(),
        correlationId: requestContent.messageId,
        type: 'caption.response',
        timestamp: new Date().toISOString(),
        data: {
          imagePath: requestContent.data.imagePath,
          perspective: requestContent.data.perspective,
          caption: 'A test caption for a beautiful graph visualization showing network connections.',
          metadata: {
            processingTime: 2000,
            provider: 'test',
            model: 'test-model'
          }
        }
      };
      
      // Publish the response message
      const responseContent = Buffer.from(JSON.stringify(responseMessage));
      channel.publish('caption.direct', QUEUES.CAPTION_RESPONSE, responseContent, {
        contentType: 'application/json',
        messageId: responseMessage.messageId,
        correlationId: responseMessage.correlationId,
        persistent: true
      });
      
      console.log('📤 Published response message');
      
      // Consume the response message
      await channel.consume(QUEUES.CAPTION_RESPONSE, (respMsg) => {
        if (!respMsg) {
          console.log('❌ Received null response message');
          return;
        }
        
        // Parse the response message
        const responseContent = JSON.parse(respMsg.content.toString());
        console.log('📥 Received response message:', responseContent);
        
        // Acknowledge the message
        channel.ack(respMsg);
        console.log('✓ Acknowledged response message');
        
        // End the test
        console.log('✅ Test completed successfully!');
        
        // Cancel consumers and close the connection
        channel.cancel('request-consumer');
        channel.cancel('response-consumer');
        
        setTimeout(() => {
          close().then(() => {
            console.log('👋 Connection closed');
            process.exit(0);
          });
        }, 1000);
      }, { consumerTag: 'response-consumer' });
    }, { consumerTag: 'request-consumer' });
    
    console.log('⏳ Waiting for messages to be processed...');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await close();
    process.exit(1);
  }
}

// Run the test
runTest(); 