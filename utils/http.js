// Send JSON response
export const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
};

// Send error response
export const sendError = (res, statusCode = 500, message = 'Internal Server Error') => {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({ error: message }));
};

// Send HTML response
export const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
};