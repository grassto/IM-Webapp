
//var argscheck = require('cordova/argscheck');
var exec = file.exec;
//var FileError = require('FileError');
//var Metadata = require('Metadata');

/**
 * Represents a file or directory on the local file system.
 *
 * @param isFile
 *            {boolean} true if Entry is a file (readonly)
 * @param isDirectory
 *            {boolean} true if Entry is a directory (readonly)
 * @param name
 *            {DOMString} name of the file or directory, excluding the path
 *            leading to it (readonly)
 * @param fullPath
 *            {DOMString} the absolute full path to the file or directory
 *            (readonly)
 * @param fileSystem
 *            {FileSystem} the filesystem on which this entry resides
 *            (readonly)
 * @param nativeURL
 *            {DOMString} an alternate URL which can be used by native
 *            webview controls, for example media players.
 *            (optional, readonly)
 */
function Entry(isFile, isDirectory, name, fullPath, fileSystem, nativeURL) {
    this.isFile = !!isFile;
    this.isDirectory = !!isDirectory;
    this.name = name || '';
    this.fullPath = fullPath || '';
    this.filesystem = fileSystem || null;
    this.nativeURL = nativeURL || null;
}

/**
 * Look up the metadata of the entry.
 *
 * @param successCallback
 *            {Function} is called with a Metadata object
 * @param errorCallback
 *            {Function} is called with a FileError
 */
Entry.prototype.getMetadata = function (successCallback, errorCallback) {
    //argscheck.checkArgs('FF', 'Entry.getMetadata', arguments);
    var success = successCallback && function (entryMetadata) {
        if (typeof (entryMetadata) != 'object' && typeof (entryMetadata) == 'string') {
            entryMetadata = JSON.parse(entryMetadata);
        }

        var metadata = new Metadata({
            size: entryMetadata.size,
            modificationTime: entryMetadata.lastModifiedDate
        });
        successCallback(metadata);
    };
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(success, fail, 'File', 'getFileMetadata', [this.toInternalURL()]);
};

/**
 * Set the metadata of the entry.
 *
 * @param successCallback
 *            {Function} is called with a Metadata object
 * @param errorCallback
 *            {Function} is called with a FileError
 * @param metadataObject
 *            {Object} keys and values to set
 */
Entry.prototype.setMetadata = function (successCallback, errorCallback, metadataObject) {
    //argscheck.checkArgs('FFO', 'Entry.setMetadata', arguments);
    exec(successCallback, errorCallback, 'File', 'setMetadata', [this.toInternalURL(), metadataObject]);
};

/**
 * Move a file or directory to a new location.
 *
 * @param parent
 *            {DirectoryEntry} the directory to which to move this entry
 * @param newName
 *            {DOMString} new name of the entry, defaults to the current name
 * @param successCallback
 *            {Function} called with the new DirectoryEntry object
 * @param errorCallback
 *            {Function} called with a FileError
 */
Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
    //argscheck.checkArgs('oSFF', 'Entry.moveTo', arguments);
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    var srcURL = this.toInternalURL();
    // entry name
    var name = newName || this.name;
    var success = function (entry) {
        if (entry) {
            if (typeof (entry) != 'object' && typeof (entry) == 'string') {
                entry = JSON.parse(entry);
            }
            if (successCallback) {
                // create appropriate Entry object
                var newFSName = entry.filesystemName || (entry.filesystem && entry.filesystem.name);
                var fs = newFSName ? new FileSystem(newFSName, { name: '', fullPath: '/' }) : new FileSystem(parent.filesystem.name, { name: '', fullPath: '/' }); // eslint-disable-line no-undef
                var result = (entry.isDirectory) ? new (require('./DirectoryEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL) : new FileEntry(entry.name, entry.fullPath, fs, entry.nativeURL);
                successCallback(result);
            }
        } else {
            // no Entry object returned
            if (fail) {
                fail(FileError.NOT_FOUND_ERR);
            }
        }
    };

    // copy
    exec(success, fail, 'File', 'moveTo', [srcURL, parent.toInternalURL(), name]);
};

/**
 * Copy a directory to a different location.
 *
 * @param parent
 *            {DirectoryEntry} the directory to which to copy the entry
 * @param newName
 *            {DOMString} new name of the entry, defaults to the current name
 * @param successCallback
 *            {Function} called with the new Entry object
 * @param errorCallback
 *            {Function} called with a FileError
 */
Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
    //argscheck.checkArgs('oSFF', 'Entry.copyTo', arguments);
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    var srcURL = this.toInternalURL();
    // entry name
    var name = newName || this.name;
    // success callback
    var success = function (entry) {
        if (entry) {
            if (typeof (entry) != 'object' && typeof (entry) == 'string') {
                entry = JSON.parse(entry);
            }
            if (successCallback) {
                // create appropriate Entry object
                var newFSName = entry.filesystemName || (entry.filesystem && entry.filesystem.name);
                var fs = newFSName ? new FileSystem(newFSName, { name: '', fullPath: '/' }) : new FileSystem(parent.filesystem.name, { name: '', fullPath: '/' }); // eslint-disable-line no-undef
                var result = (entry.isDirectory) ? new (require('./DirectoryEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL) : new FileEntry(entry.name, entry.fullPath, fs, entry.nativeURL);
                successCallback(result);
            }
        } else {
            // no Entry object returned
            if (fail) {
                fail(FileError.NOT_FOUND_ERR);
            }
        }
    };

    // copy
    exec(success, fail, 'File', 'copyTo', [srcURL, parent.toInternalURL(), name]);
};

/**
 * Return a URL that can be passed across the bridge to identify this entry.
 */
Entry.prototype.toInternalURL = function () {
    if (this.filesystem && this.filesystem.__format__) {
        return this.filesystem.__format__(this.fullPath, this.nativeURL);
    }
};

/**
 * Return a URL that can be used to identify this entry.
 * Use a URL that can be used to as the src attribute of a <video> or
 * <audio> tag. If that is not possible, construct a cdvfile:// URL.
 */
Entry.prototype.toURL = function () {
    if (this.nativeURL) {
        return this.nativeURL;
    }
    // fullPath attribute may contain the full URL in the case that
    // toInternalURL fails.
    return this.toInternalURL() || 'file://localhost' + this.fullPath;
};

/**
 * Backwards-compatibility: In v1.0.0 - 1.0.2, .toURL would only return a
 * cdvfile:// URL, and this method was necessary to obtain URLs usable by the
 * webview.
 * See CB-6051, CB-6106, CB-6117, CB-6152, CB-6199, CB-6201, CB-6243, CB-6249,
 * and CB-6300.
 */
Entry.prototype.toNativeURL = function () {
    console.log("DEPRECATED: Update your code to use 'toURL'");
    return this.toURL();
};

/**
 * Returns a URI that can be used to identify this entry.
 *
 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
 * @return uri
 */
Entry.prototype.toURI = function (mimeType) {
    console.log("DEPRECATED: Update your code to use 'toURL'");
    return this.toURL();
};

/**
 * Remove a file or directory. It is an error to attempt to delete a
 * directory that is not empty. It is an error to attempt to delete a
 * root directory of a file system.
 *
 * @param successCallback {Function} called with no parameters
 * @param errorCallback {Function} called with a FileError
 */
Entry.prototype.remove = function (successCallback, errorCallback) {
    //argscheck.checkArgs('FF', 'Entry.remove', arguments);
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(successCallback, fail, 'File', 'remove', [this.toInternalURL()]);
};

/**
 * Look up the parent DirectoryEntry of this entry.
 *
 * @param successCallback {Function} called with the parent DirectoryEntry object
 * @param errorCallback {Function} called with a FileError
 */
Entry.prototype.getParent = function (successCallback, errorCallback) {
    //argscheck.checkArgs('FF', 'Entry.getParent', arguments);
    var fs = this.filesystem;
    var win = successCallback && function (result) {
        if (typeof (result) != 'object' && typeof (result) == 'string') {
            result = JSON.parse(result);
        }
        var entry = new DirectoryEntry(result.name, result.fullPath, fs, result.nativeURL);
        successCallback(entry);
    };
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, 'File', 'getParent', [this.toInternalURL()]);
};

//module.exports = Entry;
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var argscheck = require('cordova/argscheck');
//var utils = require('cordova/utils');
var exec = file.exec;
//var Entry = require('Entry');
//var FileError = require('FileError');
//var DirectoryReader = require('DirectoryReader');

var utils = {}
utils.extend = (function () {
    // proxy used to establish prototype chain
    var F = function () { };
    // extend Child from Parent
    return function (Child, Parent) {

        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

utils.defineGetter = utils.defineGetterSetter;

/**
 * An interface representing a directory on the file system.
 *
 * {boolean} isFile always false (readonly)
 * {boolean} isDirectory always true (readonly)
 * {DOMString} name of the directory, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the directory (readonly)
 * {FileSystem} filesystem on which the directory resides (readonly)
 */
var DirectoryEntry = function (name, fullPath, fileSystem, nativeURL) {

    // add trailing slash if it is missing
    if ((fullPath) && !/\/$/.test(fullPath)) {
        fullPath += '/';
    }
    // add trailing slash if it is missing
    // wangwei edit   /\/$/  -> /\\$/
    if (nativeURL && !/\\$/.test(nativeURL)) {
        nativeURL += '/';
    }
    DirectoryEntry.__super__.constructor.call(this, false, true, name, fullPath, fileSystem, nativeURL);
};

utils.extend(DirectoryEntry, Entry);

/**
 * Creates a new DirectoryReader to read entries from this directory
 */
DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this.toInternalURL());
};

/**
 * Creates or looks up a directory
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
 * @param {Flags} options to create or exclusively create the directory
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
    //argscheck.checkArgs('sOFF', 'DirectoryEntry.getDirectory', arguments);
    var fs = this.filesystem;
    var win = successCallback && function (result) {
        if (typeof (result) != 'object' && typeof (result) == 'string') {
            result = JSON.parse(result);
        }

        var entry = new DirectoryEntry(result.name, result.fullPath, fs, result.nativeURL);
        successCallback(entry);
    };
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, 'File', 'getDirectory', [this.toInternalURL(), path, options]);
};

/**
 * Deletes a directory and all of it's contents
 *
 * @param {Function} successCallback is called with no parameters
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
    // argscheck.checkArgs('FF', 'DirectoryEntry.removeRecursively', arguments);
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(successCallback, fail, 'File', 'removeRecursively', [this.toInternalURL()]);
};

/**
 * Creates or looks up a file
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
 * @param {Flags} options to create or exclusively create the file
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
    //argscheck.checkArgs('sOFF', 'DirectoryEntry.getFile', arguments);
    var fs = this.filesystem;
    var win = successCallback && function (result) {
        if (typeof (result) != 'object' && typeof (result) == 'string') {
            result = JSON.parse(result);
        }

        //var FileEntry = require('./FileEntry');
        var entry = new FileEntry(result.name, result.fullPath, fs, result.nativeURL);
        successCallback(entry);
    };
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, 'File', 'getFile', [this.toInternalURL(), path, options]);
};

//module.exports = DirectoryEntry;


/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

var exec = file.exec;
//var FileError = require('FileError');

/**
 * An interface that lists the files and directories in a directory.
 */
function DirectoryReader(localURL) {
    this.localURL = localURL || null;
    this.hasReadEntries = false;
}

/**
 * Returns a list of entries from a directory.
 *
 * @param {Function} successCallback is called with a list of entries
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
    // If we've already read and passed on this directory's entries, return an empty list.
    if (this.hasReadEntries) {
        successCallback([]);
        return;
    }
    var reader = this;
    var win = typeof successCallback !== 'function' ? null : function (result) {
        if (typeof (result) != 'object' && typeof (result) == 'string') {
            result = JSON.parse(result);
        }

        var retVal = [];
        for (var i = 0; i < result.length; i++) {
            var entry = null;
            if (result[i].isDirectory) {
                entry = new DirectoryEntry();
            } else if (result[i].isFile) {
                entry = new FileEntry();
            }
            entry.isDirectory = result[i].isDirectory;
            entry.isFile = result[i].isFile;
            entry.name = result[i].name;
            entry.fullPath = result[i].fullPath;
            entry.filesystem = new FileSystem(result[i].filesystemName);
            entry.nativeURL = result[i].nativeURL;
            retVal.push(entry);
        }
        reader.hasReadEntries = true;
        successCallback(retVal);
    };
    var fail = typeof errorCallback !== 'function' ? null : function (code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, 'File', 'readEntries', [this.localURL]);
};

//module.exports = DirectoryReader;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */



/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * Constructor.
 * name {DOMString} name of the file, without path information
 * fullPath {DOMString} the full path of the file, including the name
 * type {DOMString} mime type
 * lastModifiedDate {Date} last modified date
 * size {Number} size of the file in bytes
 */

var File = function (name, localURL, type, lastModifiedDate, size) {
    this.name = name || '';
    this.localURL = localURL || null;
    this.type = type || null;
    this.lastModified = lastModifiedDate || null;
    // For backwards compatibility, store the timestamp in lastModifiedDate as well
    this.lastModifiedDate = lastModifiedDate || null;
    this.size = size || 0;

    // These store the absolute start and end for slicing the file.
    this.start = 0;
    this.end = this.size;
};

/**
 * Returns a "slice" of the file. Since Cordova Files don't contain the actual
 * content, this really returns a File with adjusted start and end.
 * Slices of slices are supported.
 * start {Number} The index at which to start the slice (inclusive).
 * end {Number} The index at which to end the slice (exclusive).
 */
File.prototype.slice = function (start, end) {
    var size = this.end - this.start;
    var newStart = 0;
    var newEnd = size;
    if (arguments.length) {
        if (start < 0) {
            newStart = Math.max(size + start, 0);
        } else {
            newStart = Math.min(size, start);
        }
    }

    if (arguments.length >= 2) {
        if (end < 0) {
            newEnd = Math.max(size + end, 0);
        } else {
            newEnd = Math.min(end, size);
        }
    }

    var newFile = new File(this.name, this.localURL, this.type, this.lastModified, this.size);
    newFile.start = this.start + newStart;
    newFile.end = this.start + newEnd;
    return newFile;
};

//module.exports = File;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var utils = require('cordova/utils');
//var exec = file.exec;
//var Entry = require('Entry');
//var FileWriter = require('FileWriter');
//var File = require('File');
//var FileError = require('FileError');

/**
 * An interface representing a file on the file system.
 *
 * {boolean} isFile always true (readonly)
 * {boolean} isDirectory always false (readonly)
 * {DOMString} name of the file, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the file (readonly)
 * {FileSystem} filesystem on which the file resides (readonly)
 */
var FileEntry = function (name, fullPath, fileSystem, nativeURL) {
    // remove trailing slash if it is present
    if (fullPath && /\/$/.test(fullPath)) {
        fullPath = fullPath.substring(0, fullPath.length - 1);
    }
    if (nativeURL && /\/$/.test(nativeURL)) {
        nativeURL = nativeURL.substring(0, nativeURL.length - 1);
    }

    FileEntry.__super__.constructor.apply(this, [true, false, name, fullPath, fileSystem, nativeURL]);
};

utils.extend(FileEntry, Entry);
//extend(FileEntry, Entry);

/**
 * Creates a new FileWriter associated with the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new FileWriter
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
    this.file(function (filePointer) {
        var writer = new FileWriter(filePointer);

        if (writer.localURL === null || writer.localURL === '') {
            if (errorCallback) {
                errorCallback(new FileError(FileError.INVALID_STATE_ERR));
            }
        } else {
            if (successCallback) {
                successCallback(writer);
            }
        }
    }, errorCallback);
};

/**
 * Returns a File that represents the current state of the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new File object
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.file = function (successCallback, errorCallback) {
    var localURL = this.toInternalURL();
    var win = successCallback && function (f) {
        if (typeof (f) != 'object' && typeof (f) == 'string') {
            f = JSON.parse(f);
        }
        var file = new File(f.name, localURL, f.type, f.lastModifiedDate, f.size);
        successCallback(file);
    };
    var fail = errorCallback && function (code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, 'File', 'getFileMetadata', [localURL]);
};

//module.exports = FileEntry;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * FileError
 */
function FileError(error) {
    this.code = error || null;
}

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by File API specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

//module.exports = FileError;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var exec = file.exec;
//var modulemapper = require('cordova/modulemapper');
//var utils = require('cordova/utils');
//var FileError = require('FileError');
//var ProgressEvent = require('ProgressEvent');

var getOriginalSymbol = function (context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split('.');
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

var origFileReader = getOriginalSymbol(window, 'FileReader');

/**
 * This class reads the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To read from the SD card, the file name is "sdcard/my_file.txt"
 * @constructor
 */
var FileReader = function () {
    this._readyState = 0;
    this._error = null;
    this._result = null;
    this._progress = null;
    this._localURL = '';
    this._realReader = origFileReader ? new origFileReader() : {}; // eslint-disable-line new-cap
};

/**
 * Defines the maximum size to read at a time via the native API. The default value is a compromise between
 * minimizing the overhead of many exec() calls while still reporting progress frequently enough for large files.
 * (Note attempts to allocate more than a few MB of contiguous memory on the native side are likely to cause
 * OOM exceptions, while the JS engine seems to have fewer problems managing large strings or ArrayBuffers.)
 */
FileReader.READ_CHUNK_SIZE = 256 * 1024;

// States
FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

utils.defineGetter(FileReader.prototype, 'readyState', function () {
    return this._localURL ? this._readyState : this._realReader.readyState;
});

utils.defineGetter(FileReader.prototype, 'error', function () {
    return this._localURL ? this._error : this._realReader.error;
});

utils.defineGetter(FileReader.prototype, 'result', function () {
    return this._localURL ? this._result : this._realReader.result;
});

function defineEvent(eventName) {
    utils.defineGetterSetter(FileReader.prototype, eventName, function () {
        return this._realReader[eventName] || null;
    }, function (value) {
        this._realReader[eventName] = value;
    });
}
defineEvent('onloadstart'); // When the read starts.
defineEvent('onprogress'); // While reading (and decoding) file or fileBlob data, and reporting partial file data (progress.loaded/progress.total)
defineEvent('onload'); // When the read has successfully completed.
defineEvent('onerror'); // When the read has failed (see errors).
defineEvent('onloadend'); // When the request has completed (either in success or failure).
defineEvent('onabort'); // When the read has been aborted. For instance, by invoking the abort() method.

function initRead(reader, file) {
    // Already loading something
    if (reader.readyState === FileReader.LOADING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    reader._result = null;
    reader._error = null;
    reader._progress = 0;
    reader._readyState = FileReader.LOADING;

    if (typeof file.localURL === 'string') {
        reader._localURL = file.localURL;
    } else {
        reader._localURL = '';
        return true;
    }

    if (reader.onloadstart) {
        reader.onloadstart(new ProgressEvent('loadstart', { target: reader }));
    }
}

/**
 * Callback used by the following read* functions to handle incremental or final success.
 * Must be bound to the FileReader's this along with all but the last parameter,
 * e.g. readSuccessCallback.bind(this, "readAsText", "UTF-8", offset, totalSize, accumulate)
 * @param readType The name of the read function to call.
 * @param encoding Text encoding, or null if this is not a text type read.
 * @param offset Starting offset of the read.
 * @param totalSize Total number of bytes or chars to read.
 * @param accumulate A function that takes the callback result and accumulates it in this._result.
 * @param r Callback result returned by the last read exec() call, or null to begin reading.
 */
function readSuccessCallback(readType, encoding, offset, totalSize, accumulate, r) {
    if (this._readyState === FileReader.DONE) {
        return;
    }

    var CHUNK_SIZE = FileReader.READ_CHUNK_SIZE;
    if (readType === 'readAsDataURL') {
        CHUNK_SIZE = totalSize;
        // Windows proxy does not support reading file slices as Data URLs
        // so read the whole file at once.
        //CHUNK_SIZE = cordova.platformId === 'windows' ? totalSize : // eslint-disable-line no-undef
        // Calculate new chunk size for data URLs to be multiply of 3
        // Otherwise concatenated base64 chunks won't be valid base64 data
        // FileReader.READ_CHUNK_SIZE - (FileReader.READ_CHUNK_SIZE % 3) + 3;
    }

    if (typeof r !== 'undefined') {
        accumulate(r);
        this._progress = Math.min(this._progress + CHUNK_SIZE, totalSize);

        if (typeof this.onprogress === 'function') {
            this.onprogress(new ProgressEvent('progress', { loaded: this._progress, total: totalSize }));
        }
    }

    if (typeof r === 'undefined' || this._progress < totalSize) {
        var execArgs = [
            this._localURL,
            offset + this._progress,
            offset + this._progress + Math.min(totalSize - this._progress, CHUNK_SIZE)
        ];
        if (encoding) {
            execArgs.splice(1, 0, encoding);
        }
        exec(
            readSuccessCallback.bind(this, readType, encoding, offset, totalSize, accumulate),
            readFailureCallback.bind(this),
            'File', readType, execArgs);
    } else {
        this._readyState = FileReader.DONE;

        if (typeof this.onload === 'function') {
            this.onload(new ProgressEvent('load', { target: this }));
        }

        if (typeof this.onloadend === 'function') {
            this.onloadend(new ProgressEvent('loadend', { target: this }));
        }
    }
}

/**
 * Callback used by the following read* functions to handle errors.
 * Must be bound to the FileReader's this, e.g. readFailureCallback.bind(this)
 */
function readFailureCallback(e) {
    if (this._readyState === FileReader.DONE) {
        return;
    }

    this._readyState = FileReader.DONE;
    this._result = null;
    this._error = new FileError(e);

    if (typeof this.onerror === 'function') {
        this.onerror(new ProgressEvent('error', { target: this }));
    }

    if (typeof this.onloadend === 'function') {
        this.onloadend(new ProgressEvent('loadend', { target: this }));
    }
}

/**
 * Abort reading file.
 */
FileReader.prototype.abort = function () {
    if (origFileReader && !this._localURL) {
        return this._realReader.abort();
    }
    this._result = null;

    if (this._readyState === FileReader.DONE || this._readyState === FileReader.EMPTY) {
        return;
    }

    this._readyState = FileReader.DONE;

    // If abort callback
    if (typeof this.onabort === 'function') {
        this.onabort(new ProgressEvent('abort', { target: this }));
    }
    // If load end callback
    if (typeof this.onloadend === 'function') {
        this.onloadend(new ProgressEvent('loadend', { target: this }));
    }
};

/**
 * Read text file.
 *
 * @param file          {File} File object containing file properties
 * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
 */
FileReader.prototype.readAsText = function (file, encoding) {
    if (initRead(this, file)) {
        return this._realReader.readAsText(file, encoding);
    }

    // Default encoding is UTF-8
    var enc = encoding || 'UTF-8';

    var totalSize = file.end - file.start;
    readSuccessCallback.bind(this)('readAsText', enc, file.start, totalSize, function (r) {
        if (this._progress === 0) {
            this._result = '';
        }
        this._result += r;
    }.bind(this));
};

/**
 * Read file and return data as a base64 encoded data url.
 * A data url is of the form:
 *      data:[<mediatype>][;base64],<data>
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsDataURL = function (file) {
    if (initRead(this, file)) {
        return this._realReader.readAsDataURL(file);
    }

    var totalSize = file.end - file.start;
    readSuccessCallback.bind(this)('readAsDataURL', null, file.start, totalSize, function (r) {
        var commaIndex = r.indexOf(',');
        if (this._progress === 0) {
            this._result = r;
        } else {
            this._result += r.substring(commaIndex + 1);
        }
    }.bind(this));
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsBinaryString = function (file) {
    if (initRead(this, file)) {
        return this._realReader.readAsBinaryString(file);
    }

    var totalSize = file.end - file.start;
    readSuccessCallback.bind(this)('readAsBinaryString', null, file.start, totalSize, function (r) {
        if (this._progress === 0) {
            this._result = '';
        }
        this._result += r;
    }.bind(this));
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsArrayBuffer = function (file) {
    if (initRead(this, file)) {
        return this._realReader.readAsArrayBuffer(file);
    }

    var totalSize = file.end - file.start;
    readSuccessCallback.bind(this)('readAsArrayBuffer', null, file.start, totalSize, function (r) {
        var resultArray = (this._progress === 0 ? new Uint8Array(totalSize) : new Uint8Array(this._result));
        resultArray.set(new Uint8Array(r), this._progress);
        this._result = resultArray.buffer;
    }.bind(this));
};

//module.exports = FileReader;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var DirectoryEntry = require('DirectoryEntry');

/**
 * An interface representing a file system
 *
 * @constructor
 * {DOMString} name the unique name of the file system (readonly)
 * {DirectoryEntry} root directory of the file system (readonly)
 */
var FileSystem = function (name, root) {
    this.name = name;
    if (root) {
        this.root = new DirectoryEntry(root.name, root.fullPath, this, root.nativeURL);
    } else {
        this.root = new DirectoryEntry(this.name, '/', this);
    }
};

FileSystem.prototype.__format__ = function (fullPath, nativeUrl) {
    return fullPath;
};

FileSystem.prototype.toJSON = function () {
    return '<FileSystem: ' + this.name + '>';
};

// Use instead of encodeURI() when encoding just the path part of a URI rather than an entire URI.
FileSystem.encodeURIPath = function (path) {
    // Because # is a valid filename character, it must be encoded to prevent part of the
    // path from being parsed as a URI fragment.
    return encodeURI(path).replace(/#/g, '%23');
};

//module.exports = FileSystem;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var exec = file.exec;
//var channel = require('cordova/channel');

//exports.file = {
//    // Read-only directory where the application is installed.
//    applicationDirectory: null,
//    // Root of app's private writable storage
//    applicationStorageDirectory: null,
//    // Where to put app-specific data files.
//    dataDirectory: null,
//    // Cached files that should survive app restarts.
//    // Apps should not rely on the OS to delete files in here.
//    cacheDirectory: null,
//    // Android: the application space on external storage.
//    externalApplicationStorageDirectory: null,
//    // Android: Where to put app-specific data files on external storage.
//    externalDataDirectory: null,
//    // Android: the application cache on external storage.
//    externalCacheDirectory: null,
//    // Android: the external storage (SD card) root.
//    externalRootDirectory: null,
//    // iOS: Temp directory that the OS can clear at will.
//    tempDirectory: null,
//    // iOS: Holds app-specific files that should be synced (e.g. to iCloud).
//    syncedDataDirectory: null,
//    // iOS: Files private to the app, but that are meaningful to other applications (e.g. Office files)
//    documentsDirectory: null,
//    // BlackBerry10: Files globally available to all apps
//    sharedDirectory: null
//};

//channel.waitForInitialization('onFileSystemPathsReady');
//channel.onCordovaReady.subscribe(function() {
//    function after(paths) {
//        for (var k in paths) {
//            exports.file[k] = paths[k];
//        }
//        channel.initializationComplete('onFileSystemPathsReady');
//    }
//    exec(after, null, 'File', 'requestAllPaths', []);
//});


/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

// Map of fsName -> FileSystem.
var fsMap = null;
//var FileSystem = require('FileSystem');
//var exec = file.exec;

// Overridden by Android, BlackBerry 10 and iOS to populate fsMap.
//require('./fileSystems').
getFs = function (name, callback) {
    function success(response) {
        if (typeof (response) != 'object' && typeof (response) == 'string') {
            response = JSON.parse(response);
        }

        fsMap = {};
        for (var i = 0; i < response.length; ++i) {
            var fsRoot = response[i];
            var fs = new FileSystem(fsRoot.filesystemName, fsRoot);
            fsMap[fs.name] = fs;
        }
        callback(fsMap[name]);
    }

    if (fsMap) {
        callback(fsMap[name]);
    } else {
        exec(success, null, 'File', 'requestAllFileSystems', []);
    }
};

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

// Overridden by Android, BlackBerry 10 and iOS to populate fsMap.
//module.exports.
var fileSystems = {};
fileSystems.getFs = function (name, callback) {
    callback(null);
};

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * Options to customize the HTTP request used to upload files.
 * @constructor
 * @param fileKey {String}   Name of file request parameter.
 * @param fileName {String}  Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType {String}  Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params {Object}    Object with key: value params to send to the server.
 * @param headers {Object}   Keys are header names, values are header values. Multiple
 *                           headers of the same name are not supported.
 */
var FileUploadOptions = function (fileKey, fileName, mimeType, params, headers, httpMethod) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
    this.headers = headers || null;
    this.httpMethod = httpMethod || null;
};

//module.exports = FileUploadOptions;


/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * FileUploadResult
 * @constructor
 */
//module.exports =
function FileUploadResult(size, code, content) {
    this.bytesSent = size;
    this.responseCode = code;
    this.response = content;
};

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//var exec = file.exec;
//var FileError = require('FileError');
//var ProgressEvent = require('ProgressEvent');

/**
 * This class writes to the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To write to the SD card, the file name is "sdcard/my_file.txt"
 *
 * @constructor
 * @param file {File} File object containing file properties
 * @param append if true write to the end of the file, otherwise overwrite the file
 */
var FileWriter = function (file) {
    this.fileName = '';
    this.length = 0;
    if (file) {
        this.localURL = file.localURL || file;
        this.length = file.size || 0;
    }
    // default is to write at the beginning of the file
    this.position = 0;

    this.readyState = 0; // EMPTY

    this.result = null;

    // Error
    this.error = null;

    // Event handlers
    this.onwritestart = null; // When writing starts
    this.onprogress = null; // While writing the file, and reporting partial file data
    this.onwrite = null; // When the write has successfully completed.
    this.onwriteend = null; // When the request has completed (either in success or failure).
    this.onabort = null; // When the write has been aborted. For instance, by invoking the abort() method.
    this.onerror = null; // When the write has failed (see errors).
};

// States
FileWriter.INIT = 0;
FileWriter.WRITING = 1;
FileWriter.DONE = 2;

/**
 * Abort writing file.
 */
FileWriter.prototype.abort = function () {
    // check for invalid state
    if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // set error
    this.error = new FileError(FileError.ABORT_ERR);

    this.readyState = FileWriter.DONE;

    // If abort callback
    if (typeof this.onabort === 'function') {
        this.onabort(new ProgressEvent('abort', { 'target': this }));
    }

    // If write end callback
    if (typeof this.onwriteend === 'function') {
        this.onwriteend(new ProgressEvent('writeend', { 'target': this }));
    }
};

/**
 * Writes data to the file
 *
 * @param data text or blob to be written
 * @param isPendingBlobReadResult {Boolean} true if the data is the pending blob read operation result
 */
FileWriter.prototype.write = function (data, isPendingBlobReadResult) {

    var that = this;
    var supportsBinary = (typeof window.Blob !== 'undefined' && typeof window.ArrayBuffer !== 'undefined');
    /* eslint-disable no-undef */
    var isProxySupportBlobNatively = true; // (cordova.platformId === 'windows8' || cordova.platformId === 'windows');
    var isBinary;

    // Check to see if the incoming data is a blob
    if (data instanceof File || (!isProxySupportBlobNatively && supportsBinary && data instanceof Blob)) {
        var fileReader = new FileReader();
        /* eslint-enable no-undef */
        fileReader.onload = function () {
            // Call this method again, with the arraybuffer as argument
            FileWriter.prototype.write.call(that, this.result, true /* isPendingBlobReadResult */);
        };
        fileReader.onerror = function () {
            // DONE state
            that.readyState = FileWriter.DONE;

            // Save error
            that.error = this.error;

            // If onerror callback
            if (typeof that.onerror === 'function') {
                that.onerror(new ProgressEvent('error', { 'target': that }));
            }

            // If onwriteend callback
            if (typeof that.onwriteend === 'function') {
                that.onwriteend(new ProgressEvent('writeend', { 'target': that }));
            }
        };

        // WRITING state
        this.readyState = FileWriter.WRITING;

        if (supportsBinary) {
            fileReader.readAsArrayBuffer(data);
        } else {
            fileReader.readAsText(data);
        }
        return;
    }

    // Mark data type for safer transport over the binary bridge
    isBinary = supportsBinary && (data instanceof ArrayBuffer);
    if (isBinary) {//&& cordova.platformId === 'windowsphone') { // eslint-disable-line no-undef
        // create a plain array, using the keys from the Uint8Array view so that we can serialize it
        data = Array.apply(null, new Uint8Array(data));
    }

    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING && !isPendingBlobReadResult) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === 'function') {
        me.onwritestart(new ProgressEvent('writestart', { 'target': me }));
    }

    // Write file
    exec(
        // Success callback
        function (r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // position always increases by bytes written because file would be extended
            me.position += r;
            // The length of the file is now where we are done writing.

            me.length = me.position;

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwrite callback
            if (typeof me.onwrite === 'function') {
                me.onwrite(new ProgressEvent('write', { 'target': me }));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === 'function') {
                me.onwriteend(new ProgressEvent('writeend', { 'target': me }));
            }
        },
        // Error callback
        function (e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Save error
            me.error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === 'function') {
                me.onerror(new ProgressEvent('error', { 'target': me }));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === 'function') {
                me.onwriteend(new ProgressEvent('writeend', { 'target': me }));
            }
        }, 'File', 'write', [this.localURL, data, this.position, isBinary]);
};

/**
 * Moves the file pointer to the location specified.
 *
 * If the offset is a negative number the position of the file
 * pointer is rewound.  If the offset is greater than the file
 * size the position is set to the end of the file.
 *
 * @param offset is the location to move the file pointer to.
 */
FileWriter.prototype.seek = function (offset) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    if (!offset && offset !== 0) {
        return;
    }

    // See back from end of file.
    if (offset < 0) {
        this.position = Math.max(offset + this.length, 0);
        // Offset is bigger than file size so set position
        // to the end of the file.
    } else if (offset > this.length) {
        this.position = this.length;
        // Offset is between 0 and file size so set the position
        // to start writing.
    } else {
        this.position = offset;
    }
};

/**
 * Truncates the file to the size specified.
 *
 * @param size to chop the file at.
 */
FileWriter.prototype.truncate = function (size) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === 'function') {
        me.onwritestart(new ProgressEvent('writestart', { 'target': this }));
    }

    // Write file
    exec(
        // Success callback
        function (r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Update the length of the file
            me.length = r;
            me.position = Math.min(me.position, r);

            // If onwrite callback
            if (typeof me.onwrite === 'function') {
                me.onwrite(new ProgressEvent('write', { 'target': me }));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === 'function') {
                me.onwriteend(new ProgressEvent('writeend', { 'target': me }));
            }
        },
        // Error callback
        function (e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Save error
            me.error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === 'function') {
                me.onerror(new ProgressEvent('error', { 'target': me }));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === 'function') {
                me.onwriteend(new ProgressEvent('writeend', { 'target': me }));
            }
        }, 'File', 'truncate', [this.localURL, size]);
};

//module.exports = FileWriter;


/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * Supplies arguments to methods that lookup or create files and directories.
 *
 * @param create
 *            {boolean} file or directory if it doesn't exist
 * @param exclusive
 *            {boolean} used with create; if true the command will fail if
 *            target path exists
 */
function Flags(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
}

//module.exports = Flags;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//exports.
TEMPORARY = 0;
//exports.
PERSISTENT = 1;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * Information about the state of the file or directory
 *
 * {Date} modificationTime (readonly)
 */
var Metadata = function (metadata) {
    if (typeof metadata === 'object') {
        this.modificationTime = new Date(metadata.modificationTime);
        this.size = metadata.size || 0;
    } else if (typeof metadata === 'undefined') {
        this.modificationTime = null;
        this.size = 0;
    } else {
        /* Backwards compatiblity with platforms that only return a timestamp */
        this.modificationTime = new Date(metadata);
    }
};

//module.exports = Metadata;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

// If ProgressEvent exists in global context, use it already, otherwise use our own polyfill
// Feature test: See if we can instantiate a native ProgressEvent;
// if so, use that approach,
// otherwise fill-in with our own implementation.
//
// NOTE: right now we always fill in with our own. Down the road would be nice if we can use whatever is native in the webview.
var ProgressEvent = (function () {
    /*
    var createEvent = function(data) {
        var event = document.createEvent('Events');
        event.initEvent('ProgressEvent', false, false);
        if (data) {
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    event[i] = data[i];
                }
            }
            if (data.target) {
                // TODO: cannot call <some_custom_object>.dispatchEvent
                // need to first figure out how to implement EventTarget
            }
        }
        return event;
    };
    try {
        var ev = createEvent({type:"abort",target:document});
        return function ProgressEvent(type, data) {
            data.type = type;
            return createEvent(data);
        };
    } catch(e){
    */
    return function ProgressEvent(type, dict) {
        this.type = type;
        this.bubbles = false;
        this.cancelBubble = false;
        this.cancelable = false;
        this.lengthComputable = false;
        this.loaded = dict && dict.loaded ? dict.loaded : 0;
        this.total = dict && dict.total ? dict.total : 0;
        this.target = dict && dict.target ? dict.target : null;
    };
    // }
})();

//module.exports = ProgressEvent;

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

//(function() {
// For browser platform: not all browsers use this file.
//function checkBrowser() {
//    //if (cordova.platformId === 'browser' && require('./isChrome')()) { // eslint-disable-line no-undef
//    //    module.exports = window.requestFileSystem || window.webkitRequestFileSystem;
//    //    return true;
//    //}
//    return false;
//}
//if (checkBrowser()) {
//    return;
//}

//var argscheck = require('cordova/argscheck');
//var FileError = require('FileError');
//var FileSystem = require('FileSystem');
//var exec = file.exec;
//var fileSystems = require('fileSystems');

/**
 * Request a file system in which to store application data.
 * @param type  local file system type
 * @param size  indicates how much storage space, in bytes, the application expects to need
 * @param successCallback  invoked with a FileSystem object
 * @param errorCallback  invoked if error occurs retrieving file system
 */
requestFileSystem = function (type, size, successCallback, errorCallback) {
    //argscheck.checkArgs('nnFF', 'requestFileSystem', arguments);
    var fail = function (code) {
        if (errorCallback) {
            errorCallback(new FileError(code));
        }
    };

    if (type < 0) {
        fail(FileError.SYNTAX_ERR);
    } else {
        // if successful, return a FileSystem object
        var success = function (file_system) {

            if (typeof (file_system) != 'object' && typeof (file_system) == 'string') {
                file_system = JSON.parse(file_system);
            }

            if (file_system) {
                if (successCallback) {
                    fileSystems.getFs(file_system.name, function (fs) {
                        // This should happen only on platforms that haven't implemented requestAllFileSystems (windows)
                        if (!fs) {
                            fs = new FileSystem(file_system.name, file_system.root);
                        }
                        successCallback(fs);
                    });
                }
            } else {
                // no FileSystem object returned
                fail(FileError.NOT_FOUND_ERR);
            }
        };
        exec(success, fail, 'File', 'requestFileSystem', [type, size]);
    }
};

//module.exports = requestFileSystem;
//})();

/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
//(function() {
// For browser platform: not all browsers use overrided `resolveLocalFileSystemURL`.
//function checkBrowser() {
//    //if (cordova.platformId === 'browser' && require('./isChrome')()) { // eslint-disable-line no-undef
//    //    module.exports.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
//    //    return true;
//    //}
//    return false;
//}
//if (checkBrowser()) {
//    return;
//}

//var argscheck = require('cordova/argscheck');
//var DirectoryEntry = require('DirectoryEntry');
//var FileEntry = require('FileEntry');
//var FileError = require('FileError');
//var exec = file.exec;
//var fileSystems = require('fileSystems');

/**
 * Look up file system Entry referred to by local URI.
 * @param {DOMString} uri  URI referring to a local file or directory
 * @param successCallback  invoked with Entry object corresponding to URI
 * @param errorCallback    invoked if error occurs retrieving file system entry
 */
//  module.exports.module.exports.resolveLocalFileSystemURL ||

resolveLocalFileSystemURL = function (uri, successCallback, errorCallback) {
    //argscheck.checkArgs('sFF', 'resolveLocalFileSystemURI', arguments);
    // error callback

    console.log('xxxxxx: ' + uri)
    var fail = function (error) {
        if (errorCallback) {
            errorCallback(new FileError(error));
        }
    };
    // sanity check for 'not:valid:filename' or '/not:valid:filename'
    // file.spec.12 window.resolveLocalFileSystemURI should error (ENCODING_ERR) when resolving invalid URI with leading /.
    if (!uri || uri.split(':').length > 3) {
        setTimeout(function () {
            fail(FileError.ENCODING_ERR);
        }, 0);
        return;
    }
    // if successful, return either a file or directory entry
    var success = function (entry) {
        if (entry) {
            if (typeof (entry) != 'object' && typeof (entry) == 'string') {
                entry = JSON.parse(entry);
            }

            if (successCallback) {
                // create appropriate Entry object
                var fsName = entry.filesystemName || (entry.filesystem && entry.filesystem.name) || (entry.filesystem === window.PERSISTENT ? 'persistent' : 'temporary'); // eslint-disable-line no-undef
                fileSystems.getFs(fsName, function (fs) {
                    // This should happen only on platforms that haven't implemented requestAllFileSystems (windows)
                    if (!fs) {
                        fs = new FileSystem(fsName, { name: '', fullPath: '/' }); // eslint-disable-line no-undef
                    }
                    var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, fs, entry.nativeURL) : new FileEntry(entry.name, entry.fullPath, fs, entry.nativeURL);
                    successCallback(result);
                });
            }
        } else {
            // no Entry object returned
            fail(FileError.NOT_FOUND_ERR);
        }
    };

    exec(success, fail, 'File', 'resolveLocalFileSystemURI', [uri]);
};

//module.exports.
resolveLocalFileSystemURI = function () {
    console.log('resolveLocalFileSystemURI is deprecated. Please call resolveLocalFileSystemURL instead.');
    //        module.exports.
    resolveLocalFileSystemURL.apply(this, arguments);
};
//})();