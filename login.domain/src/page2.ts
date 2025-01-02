import { DB_NAME, STORE_NAME, initDB, closeDB } from './db';

async function getSecret() {
  try {
    const db = await initDB();
    
    return new Promise<string>((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('secretKey');

        request.onsuccess = () => {
          console.log('Secret retrieved successfully');
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error in request:', request.error);
          reject(request.error);
        };

        transaction.oncomplete = () => {
          console.log('Transaction completed');
          closeDB();
        };

        transaction.onerror = (event) => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction failed'));
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

window.onload = async () => {
  try {
    const secret = await getSecret();
    if (secret) {
      console.log('Secret found, sending to opener');
      window.opener?.postMessage({ type: 'SECRET_VALUE', secret }, '*');
      window.close();
    } else {
      console.log('No secret found');
      document.body.innerHTML += '<p>No secret found in database</p>';
    }
  } catch (error) {
    console.error('Error reading secret:', error);
    document.body.innerHTML += `<p>Error reading secret from database: ${(error as Error).message}</p>`;
  }
}; 