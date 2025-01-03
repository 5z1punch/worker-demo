// Wait for iframe to be ready
let iframeReady = false;

window.addEventListener('message', (event) => {
  if (event.origin === 'http://127.0.0.1:5173') {
    console.log('App: Received message:', event.data);
    const data = event.data;

    if (data.type === 'READY') {
      iframeReady = true;
      return;
    }

    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      if (data.type === 'SECRET_VALUE') {
        resultDiv.textContent = `Secret from login domain: ${data.secret}`;
      } else if (data.type === 'ERROR') {
        resultDiv.textContent = `Error: ${data.error}`;
      }
    }
  }
});

document.getElementById('getSecret')?.addEventListener('click', () => {
  if (!iframeReady) {
    console.error('Iframe not ready yet');
    return;
  }

  const iframe = document.getElementById('secretFrame') as HTMLIFrameElement;
  if (!iframe.contentWindow) {
    console.error('No iframe content window available');
    return;
  }
  
  // Send request to iframe
  console.log('App: Requesting secret');
  iframe.contentWindow.postMessage({ 
    type: 'GET_SECRET'
  }, 'http://127.0.0.1:5173');
}); 