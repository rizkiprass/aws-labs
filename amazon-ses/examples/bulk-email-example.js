/**
 * Bulk Email Example - Send to Thousands/Millions of Emails
 * 
 * Best practices for sending emails in large volumes
 */

import { SESClient, SendBulkTemplatedEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

// ============================================
// Method 1: Batch with Chunk
// ============================================
async function sendBulkEmailInBatches(recipients, templateName) {
  const BATCH_SIZE = 50; // SES limit per bulk call
  const results = [];

  // Split recipients into chunks
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    
    console.log(`Sending batch ${i / BATCH_SIZE + 1}...`);
    
    const params = {
      Source: 'noreply@abc.com',
      Template: templateName,
      DefaultTemplateData: JSON.stringify({
        company: 'ABC Corp',
        year: new Date().getFullYear()
      }),
      Destinations: batch.map(recipient => ({
        Destination: { ToAddresses: [recipient.email] },
        ReplacementTemplateData: JSON.stringify(recipient.data)
      }))
    };

    try {
      const command = new SendBulkTemplatedEmailCommand(params);
      const response = await sesClient.send(command);
      results.push(...response.Status);
      
      // Rate limiting - wait a moment before the next batch
      if (i + BATCH_SIZE < recipients.length) {
        await sleep(1000); // 1 second delay
      }
    } catch (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      // Log failed batch untuk retry nanti
      results.push({ error: error.message, batch });
    }
  }

  return results;
}

// ============================================
// Method 2: Parallel Processing with Queue
// ============================================
class EmailQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }

  async add(emailTask) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task: emailTask, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

async function sendWithQueue(recipients, templateName) {
  const queue = new EmailQueue(5); // 5 concurrent batches
  const BATCH_SIZE = 50;
  const batches = [];

  // Split into batches
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  // Process all batches with queue
  const results = await Promise.all(
    batches.map((batch, index) => 
      queue.add(async () => {
        console.log(`Processing batch ${index + 1}/${batches.length}`);
        
        const params = {
          Source: 'noreply@abc.com',
          Template: templateName,
          Destinations: batch.map(r => ({
            Destination: { ToAddresses: [r.email] },
            ReplacementTemplateData: JSON.stringify(r.data)
          }))
        };

        const command = new SendBulkTemplatedEmailCommand(params);
        return await sesClient.send(command);
      })
    )
  );

  return results;
}

// ============================================
// Method 3: Database-driven with Retry
// ============================================
async function sendFromDatabase() {
  // Pseudo-code - adjust according to your database
  
  const BATCH_SIZE = 50;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    // Fetch batch dari database
    const recipients = await db.query(`
      SELECT email, name, order_id, amount 
      FROM email_queue 
      WHERE status = 'pending'
      LIMIT ${BATCH_SIZE}
      OFFSET ${offset}
    `);

    if (recipients.length === 0) {
      hasMore = false;
      break;
    }

    try {
      // Send batch
      const params = {
        Source: 'noreply@abc.com',
        Template: 'OrderConfirmation',
        Destinations: recipients.map(r => ({
          Destination: { ToAddresses: [r.email] },
          ReplacementTemplateData: JSON.stringify({
            name: r.name,
            orderId: r.order_id,
            amount: r.amount
          })
        }))
      };

      const command = new SendBulkTemplatedEmailCommand(params);
      const response = await sesClient.send(command);

      // Update status di database
      const emailIds = recipients.map(r => r.id);
      await db.query(`
        UPDATE email_queue 
        SET status = 'sent', sent_at = NOW()
        WHERE id IN (${emailIds.join(',')})
      `);

      console.log(`Sent ${recipients.length} emails`);
      
    } catch (error) {
      console.error('Batch failed:', error.message);
      
      // Mark as failed for retry
      await db.query(`
        UPDATE email_queue 
        SET status = 'failed', 
            error_message = '${error.message}',
            retry_count = retry_count + 1
        WHERE id IN (${recipients.map(r => r.id).join(',')})
      `);
    }

    offset += BATCH_SIZE;
    await sleep(1000); // Rate limiting
  }
}

// ============================================
// Helper Functions
// ============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Example Usage
// ============================================
async function main() {
  // Example data for 10,000 recipients
  const recipients = Array.from({ length: 10000 }, (_, i) => ({
    email: `user${i}@example.com`,
    data: {
      name: `User ${i}`,
      orderId: `ORD-${1000 + i}`,
      amount: (Math.random() * 1000).toFixed(2)
    }
  }));

  console.log(`Sending to ${recipients.length} recipients...`);

  // Choose one method:
  
  // Method 1: Simple batching
  // await sendBulkEmailInBatches(recipients, 'OrderConfirmation');
  
  // Method 2: Parallel with queue
  // await sendWithQueue(recipients, 'OrderConfirmation');
  
  // Method 3: Database-driven
  // await sendFromDatabase();

  console.log('All emails sent!');
}

// ============================================
// Rate Limits & Best Practices
// ============================================
/*
SES Limits (default sandbox):
- Max 200 emails per 24 hours
- Max 1 email per second

SES Limits (production):
- Starts at 50,000 per 24 hours
- Max 14 emails per second
- Can request increase

SendBulkTemplatedEmail:
- Max 50 destinations per call
- Each destination counts as 1 email

Best Practices:
1. Use templates for bulk email
2. Batch 50 recipients per API call
3. Add delay between batches (1 second)
4. Implement retry logic for failed batches
5. Track status in database
6. Monitor bounce & complaint rates
7. Use SES Configuration Sets for tracking
8. Implement unsubscribe mechanism
*/

export {
  sendBulkEmailInBatches,
  sendWithQueue,
  sendFromDatabase
};
