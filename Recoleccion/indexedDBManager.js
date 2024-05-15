window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
    window.mozIDBKeyRange || window.msIDBKeyRange;

const DBVersion = 5;

// Flag to control table name incrementation
let shouldIncrementTableName = false;

//// IndexedDB related functions
const dbPromise = (() => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('MineralDataDB', DBVersion);
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('submissions')) {
                const submissionsOS = db.createObjectStore('submissions', { autoIncrement: true, keyPath: "IDGen" });
                submissionsOS.createIndex('DateTime', 'DateTime', { unique: false });
                submissionsOS.createIndex('Timer', 'Timer', { unique: false });
                submissionsOS.createIndex('TEnable', 'TEnable', { unique: false });
                submissionsOS.createIndex('tableName', 'tableName', { unique: false });
                submissionsOS.createIndex('userName', 'userName', { unique: false });
                submissionsOS.createIndex('userMail', 'userMail', { unique: false });
                submissionsOS.createIndex('Data', 'Data', { unique: false });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
            console.log('IndexedDB initialized successfully');
        };
    });
})();

const generateTableName = async () => {
    const db = await dbPromise;
    const transaction = db.transaction('submissions', 'readonly');
    const store = transaction.objectStore('submissions');
    // const index = store.index('tableName');
    const request = store.getAll();

    const date = new Date();
    const formattedDate = `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}`;
    const prefix = `TB`;
    let maxCount = 0;
    await new Promise(resolve => {
        request.onsuccess = (e) => {
            const submissions = e.target.result;
            if (submissions.length === 0) {
                maxCount=1;
                resolve();
            }
            // Group submissions by tableName
            const groupedSubmissions = submissions.reduce((acc, submission) => {
                (acc[submission.tableName] = acc[submission.tableName] || []).push(submission);
                return acc;
            }, {});
            Object.keys(groupedSubmissions).forEach(tableNameOr => {
                if(tableNameOr.includes(formattedDate)){
                const parts = tableNameOr.split('-');
                const currentCount = parseInt(parts[0].replace(prefix, ''), 10);
                maxCount = Math.max(maxCount, currentCount);
            }
            });
            resolve();
        };
    });
    if (shouldIncrementTableName) {
        maxCount += 1; // Increment only if flag is true
        shouldIncrementTableName = false; // Reset flag after incrementing
    } else if (maxCount === 0) { // If no entries for today, start with TB1
        maxCount = 1;
    }

    const tableName = `${prefix}${maxCount}-${formattedDate}`;
    console.log(`Generated table name: ${tableName}`);
    return tableName;
};

// Function to set the flag for incrementing table name
const enableTableNameIncrement = () => {
    shouldIncrementTableName = true;
    console.log('Table name incrementation enabled.');
};

// Expose the enableTableNameIncrement function to be called from other scripts
window.enableTableNameIncrement = enableTableNameIncrement;