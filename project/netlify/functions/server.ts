import { Handler } from '@netlify/functions';
import { handleSquareWebhook } from '../../src/api/webhooks/square';

export const handler: Handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-square-signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  // Handle Square webhook
  if (event.path === '/api/webhooks/square') {
    try {
      const result = await handleSquareWebhook(JSON.parse(event.body || '{}'));
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error('Error handling Square webhook:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  // Handle other routes
  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ error: 'Not found' }),
  };
}; 