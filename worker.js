addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetHost = 'www.example.to'; // Replace with the target website
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  let response = await fetch(modifiedRequest);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Access-Control-Allow-Origin', '*');

  // If the content type is HTML, we need to rewrite URLs in the body
  if (response.headers.get('content-type').includes('text/html')) {
    let body = await response.text();

    // Rewrite absolute URLs
    body = body.replace(new RegExp(`https://${targetHost}`, 'g'), url.origin);
    body = body.replace(new RegExp(`http://${targetHost}`, 'g'), url.origin);

    // Rewrite relative URLs
    body = body.replace(new RegExp(`href="/`, 'g'), `href="${url.origin}/`);
    body = body.replace(new RegExp(`src="/`, 'g'), `src="${url.origin}/`);

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } else {
    // For non-HTML responses, just pass them through
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
}
