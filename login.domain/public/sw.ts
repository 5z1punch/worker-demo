/// <reference lib="webworker" />

const DB_NAME = 'SecretDB';
const STORE_NAME = 'secrets';

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      console.error('SW: Database error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('SW: Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('SW: Upgrading database...');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('SW: Creating object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getSecret() {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('secretKey');

      request.onsuccess = () => {
        console.log('SW: Secret retrieved:', request.result);
        resolve(request.result);
        db.close();
      };

      request.onerror = () => {
        console.error('SW: Error getting secret:', request.error);
        reject(request.error);
        db.close();
      };
    });
  } catch (error) {
    console.error('SW: Error initializing DB:', error);
    throw error;
  }
}

self.addEventListener('install', (event) => {
  console.log('SW: Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('SW: Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from clients
self.addEventListener('message', async (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data.type === 'GET_SECRET') {
    try {
      console.log('SW: Getting secret');
      const secret = await getSecret();
      console.log('SW: Got secret:', secret);
      
      // Make sure we have a client to respond to
      if (event.source) {
        console.log('SW: Sending secret back to client');
        event.source.postMessage({
          type: 'SECRET_VALUE',
          secret: secret
        });
      } else {
        console.error('SW: No client to respond to');
      }
    } catch (error) {
      console.error('SW: Error getting secret:', error);
      if (event.source) {
        event.source.postMessage({
          type: 'ERROR',
          error: error.message || error
        });
      }
    }
  }
}); 