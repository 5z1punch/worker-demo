/// <reference lib="webworker" />

declare var self: SharedWorkerGlobalScope;

const DB_NAME = 'SecretDB';
const STORE_NAME = 'secrets';
let dbInstance: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  console.log('Worker: initDB');
  if (dbInstance) {
    console.log('Worker: already initialized');
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    let request = indexedDB.open(DB_NAME);
    
    request.onsuccess = () => {
      const db = request.result;
      const currentVersion = db.version;
      db.close();

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('Worker: Store not found, creating with new version');
        request = indexedDB.open(DB_NAME, currentVersion + 1);

        request.onupgradeneeded = (event) => {
          console.log('Worker: Upgrading database...');
          const db = (event.target as IDBOpenDBRequest).result;
          console.log('Worker: Creating object store:', STORE_NAME);
          db.createObjectStore(STORE_NAME);
        };

        request.onsuccess = () => {
          console.log('Worker: Database upgraded and store created');
          dbInstance = request.result;
          resolve(dbInstance);
        };

        request.onerror = () => {
          console.error('Worker: Database upgrade error:', request.error);
          reject(request.error);
        };
      } else {
        console.log('Worker: Store exists, opening database');
        request = indexedDB.open(DB_NAME);
        
        request.onsuccess = () => {
          dbInstance = request.result;
          resolve(dbInstance);
        };

        request.onerror = () => {
          console.error('Worker: Database error:', request.error);
          reject(request.error);
        };
      }
    };

    request.onerror = () => {
      console.error('Worker: Initial database open error:', request.error);
      reject(request.error);
    };
  });
}

async function getSecret() {
  try {
    const db = await initDB();
    return new Promise<string>((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('secretKey');

        request.onsuccess = () => {
          console.log('Worker: Secret retrieved successfully');
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Worker: Error in request:', request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Worker: Error in transaction creation:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Worker: Error in initDB:', error);
    throw error;
  }
}

// Handle connections from different origins
self.onconnect = (event) => {
  const port = event.ports[0];
  
  port.onmessage = async (e) => {
    if (e.data.type === 'GET_SECRET') {
      try {
        const secret = await getSecret();
        port.postMessage({ type: 'SECRET_VALUE', secret });
      } catch (error) {
        port.postMessage({ type: 'ERROR', error: (error as Error).message });
      }
    }
  };

  port.start();
}; 