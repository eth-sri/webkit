if (this.importScripts) {
    importScripts('../../../fast/js/resources/js-test-pre.js');
    importScripts('shared.js');
}

description("Test IndexedDB keys ordering and readback from cursors.");

function test()
{
    removeVendorPrefixes();

    prepareDatabase();
}

function prepareDatabase()
{
    debug("");
    evalAndLog("openreq = indexedDB.open('cursor-reverse-bug')");
    openreq.onerror = unexpectedErrorCallback;
    openreq.onsuccess = function() {
        evalAndLog("db = openreq.result");
        evalAndLog("verreq = db.setVersion('1')");
        verreq.onerror = unexpectedErrorCallback;
        verreq.onsuccess = function() {
            deleteAllObjectStores(db);
            store = evalAndLog("store = db.createObjectStore('store')");
            evalAndLog("store.createIndex('index', '')");
            verreq.result.oncomplete = populateStore;
        };
    };
}

function populateStore()
{
    debug("");
    debug("populating store...");
    evalAndLog("trans = db.transaction('store', IDBTransaction.READ_WRITE)");
    evalAndLog("store = trans.objectStore('store');");
    trans.onerror = unexpectedErrorCallback;
    trans.onabort = unexpectedAbortCallback;

    evalAndLog("store.put(1, 1)");
    evalAndLog("store.put(2, 2)");
    evalAndLog("store.put(3, 3)");
    trans.oncomplete = testCursor;
}

var tests = [
                {upperBound: 7, open: false, expected: 3},
                {upperBound: 7, open: true,  expected: 3},
                {upperBound: 3, open: false, expected: 3},
                {upperBound: 3, open: true,  expected: 2}
            ];

function testCursor()
{
    debug("testCursor()");

    if (tests.length === 0) {
        debug("No more tests.");
        finishJSTest();
        return;
    }

    test = tests.shift();

    evalAndLog("trans = db.transaction('store', IDBTransaction.READ_ONLY)");
    trans.onerror = unexpectedErrorCallback;
    trans.onabort = unexpectedAbortCallback;
    trans.oncomplete = testCursor;
    evalAndLog("store = trans.objectStore('store');");
    evalAndLog("index = store.index('index');");

    var testFunction = function() {
        evalAndLog("cursor = event.target.result");
        if (cursor === null) {
            debug("cursor should not be null");
            fail();
            return;
        }

        shouldBe("cursor.key", "test.expected");
        if ("value" in cursor)
            shouldBe("cursor.value", "test.expected");
        shouldBe("cursor.primaryKey", "test.expected");

        // Let the transaction finish.
    }

    debug("upperBound: " + test.upperBound + " open: " + test.open + " expected: " + test.expected);
    storeReq = evalAndLog("storeReq = store.openCursor(IDBKeyRange.upperBound(test.upperBound, test.open), IDBCursor.PREV)");
    storeReq.onsuccess = testFunction;

    indexReq = evalAndLog("indexReq = index.openCursor(IDBKeyRange.upperBound(test.upperBound, test.open), IDBCursor.PREV)");
    indexReq.onsuccess = testFunction;

    indexKeyReq = evalAndLog("indexKeyReq = index.openKeyCursor(IDBKeyRange.upperBound(test.upperBound, test.open), IDBCursor.PREV)");
    indexKeyReq.onsuccess = testFunction;
}

test();