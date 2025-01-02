// Create a new shared database module
export const DB_NAME = 'SecretDB';
export const STORE_NAME = 'secrets';
let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  console.log('initDB');
  if (dbInstance) {
    console.log('already initialized');
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    // First try to open the database to check if it exists
    let request = indexedDB.open(DB_NAME);
    
    request.onsuccess = () => {
      const db = request.result;
      const currentVersion = db.version;
      db.close();

      // If the store doesn't exist, increment version to trigger onupgradeneeded
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('Store not found, creating with new version');
        // Open again with a higher version to trigger onupgradeneeded
        request = indexedDB.open(DB_NAME, currentVersion + 1);

        request.onupgradeneeded = (event) => {
          console.log('Upgrading database...');
          const db = (event.target as IDBOpenDBRequest).result;
          console.log('Creating object store:', STORE_NAME);
          db.createObjectStore(STORE_NAME);
        };

        request.onsuccess = () => {
          console.log('Database upgraded and store created');
          dbInstance = request.result;
          resolve(dbInstance);
        };

        request.onerror = () => {
          console.error('Database upgrade error:', request.error);
          reject(request.error);
        };
      } else {
        // If store exists, just open normally
        console.log('Store exists, opening database');
        request = indexedDB.open(DB_NAME);
        
        request.onsuccess = () => {
          dbInstance = request.result;
          resolve(dbInstance);
        };

        request.onerror = () => {
          console.error('Database error:', request.error);
          reject(request.error);
        };
      }
    };

    request.onerror = () => {
      console.error('Initial database open error:', request.error);
      reject(request.error);
    };
  });
}

export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
} 