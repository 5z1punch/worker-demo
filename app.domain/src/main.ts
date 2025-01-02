document.getElementById('getSecret')?.addEventListener('click', async () => {
  try {
    console.log('App: Creating iframe');
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'http://localhost:5173/messenger.html';
    
    document.body.appendChild(iframe);

    // Wait for the iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => {
        console.log('App: Iframe loaded');
        resolve();
      };
    });

    // Set up message listener
    window.addEventListener('message', (event) => {
      console.log('App: Received message:', event.data);
      if (event.origin === 'http://localhost:5173') {
        const data = event.data;
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
          if (data.type === 'SECRET_VALUE') {
            resultDiv.textContent = `Secret from login domain: ${data.secret}`;
          } else if (data.type === 'ERROR') {
            resultDiv.textContent = `Error: ${data.error}`;
          }
        }
        // Clean up
        document.body.removeChild(iframe);
      }
    }, { once: true });

    console.log('App: Sending message to iframe');
    // Make sure the iframe's contentWindow is available
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'GET_SECRET' }, 'http://localhost:5173');
    } else {
      throw new Error('Iframe contentWindow not available');
    }
  } catch (error) {
    console.error('App: Failed to get secret:', error);
    alert('Failed to get secret: ' + (error as Error).message);
  }
}); 