/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

const DB_NAME = 'SecretDB';
const STORE_NAME = 'secrets';

async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

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
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('SW: Creating object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getSecret(): Promise<string | undefined> {
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
}

self.addEventListener('install', (event) => {
  console.log('SW: Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('SW: Service Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Optionally clear any old caches here
    ])
  );
});

self.addEventListener('fetch', (event) => {
  console.log('SW: Fetch intercepted:', event.request.url);
  
  const url = new URL(event.request.url);
  if (url.pathname === '/get-secret') {
    console.log('SW: Handling get-secret request');
    event.respondWith(
      getSecret()
        .then(secret => {
          console.log('SW: Sending secret response:', secret);
          return new Response(JSON.stringify({ secret }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        })
        .catch(error => {
          console.error('SW: Error getting secret:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        })
    );
  }
}); 