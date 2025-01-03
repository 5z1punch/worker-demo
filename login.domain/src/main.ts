document.getElementById('getSecret')?.addEventListener('click', () => {
  const iframe = document.getElementById('secretFrame') as HTMLIFrameElement;
  
  // Send request to iframe
  console.log('App: Requesting secret');
  iframe.contentWindow?.postMessage({ type: 'GET_SECRET' }, 'http://localhost:5173');
});

// Listen for messages from iframe
window.addEventListener('message', (event) => {
  if (event.origin === 'http://localhost:5173') {
    console.log('App: Received message:', event.data);
    const data = event.data;
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