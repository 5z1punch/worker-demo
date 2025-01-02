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
    const db = await initDB();
    
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(secret, 'secretKey');

        request.onsuccess = () => {
          console.log('Secret saved successfully');
          resolve();
        };

        request.onerror = () => {
          console.error('Error in request:', request.error);
          reject(request.error);
        };

        transaction.oncomplete = () => {
          console.log('Transaction completed');
          closeDB();
        };
      } catch (error) {
        console.error('Error in transaction creation:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in initDB:', error);
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