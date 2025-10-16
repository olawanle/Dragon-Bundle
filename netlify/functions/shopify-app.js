// Netlify Function to handle Shopify app requests
const { createRequestHandler } = require("@react-router/node");

// This would need to be adapted for Netlify Functions
// For now, let's create a simple redirect to the correct hosting solution

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dragon Bundle - Shopify App</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div style="text-align: center; padding: 2rem; font-family: Arial, sans-serif;">
            <h1>🐉 Dragon Bundle</h1>
            <p>This Shopify app requires server-side hosting.</p>
            <p>Please deploy to a platform that supports Node.js servers like:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
              <li><a href="https://vercel.com">Vercel</a></li>
              <li><a href="https://railway.app">Railway</a></li>
              <li><a href="https://render.com">Render</a></li>
              <li><a href="https://heroku.com">Heroku</a></li>
            </ul>
            <p>Or use Shopify CLI for local development:</p>
            <code style="background: #f5f5f5; padding: 0.5rem; border-radius: 4px;">
              shopify app dev
            </code>
          </div>
        </body>
      </html>
    `
  };
};
