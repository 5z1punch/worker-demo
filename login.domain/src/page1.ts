import { DB_NAME, STORE_NAME, initDB, closeDB } from './db';

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.ts', { 
    scope: '/'
  })
    .then(registration => {
      console.log('ServiceWorker registration successful with scope:', registration.scope);
    })
    .catch(error => {
      console.error('ServiceWorker registration failed:', error);
    });
}

async function saveSecret(secret: string) {
  try {
    localStorage.setItem('secretKey', secret);
    console.log('Secret saved successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving secret:', error);
    throw error;
  }
}

document.getElementById('saveButton')?.addEventListener('click', async () => {
  const input = document.getElementById('secretInput') as HTMLInputElement;
  if (input.value) {
    try {
      await saveSecret(input.value);
      alert('Secret saved!');
    } catch (error) {
      console.error('Error saving secret:', error);
      alert('Failed to save secret: ' + (error as Error).message);
    }
  }
}); 