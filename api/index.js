// Vercel serverless function for Shopify app
const { createRequestHandler } = require("@react-router/node");

// Import the built server
const build = require("../build/server/index.js");

// Create the request handler
const requestHandler = createRequestHandler(build, process.env.NODE_ENV);

module.exports = async (req, res) => {
  try {
    // Convert Vercel request to Node.js request format
    const url = new URL(req.url, `https://${req.headers.host}`);
    
    const nodeReq = {
      method: req.method,
      url: url.pathname + url.search,
      headers: req.headers,
      body: req.body,
    };

    const nodeRes = {
      statusCode: 200,
      headers: {},
      end: (data) => {
        res.status(nodeRes.statusCode);
        Object.entries(nodeRes.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.end(data);
      },
      setHeader: (key, value) => {
        nodeRes.headers[key] = value;
      },
      writeHead: (statusCode, headers) => {
        nodeRes.statusCode = statusCode;
        if (headers) {
          Object.assign(nodeRes.headers, headers);
        }
      },
    };

    await requestHandler(nodeReq, nodeRes);
  } catch (error) {
    console.error("Error in Vercel handler:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message 
    });
  }
};
