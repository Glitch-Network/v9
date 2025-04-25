/**
 * Simple Windows-style file system emulation using localStorage.
 * Uses drive letters and backslash separators.
 */

const FS_KEY = 'emulatedFileSystemWin';

/**
 * Normalize path to uppercase drive letter and backslashes.
 * If isDir is true, ensure trailing backslash for directories.
 * If isDir is false, do not add trailing backslash (for files).
 * @param {string} path 
 * @param {boolean} isDir 
 * @returns {string}
 */
function normalizePath(path, isDir = true) {
  if (!path) return 'C:\\';
  path = path.replace(/\//g, '\\');
  if (!/^[A-Z]:\\/.test(path.toUpperCase())) {
    path = 'C:\\' + path;
  }
  if (isDir && !path.endsWith('\\')) {
    path += '\\';
  }
  return path.toUpperCase();
}

/**
 * Retrieve the file system object from localStorage.
 * Initializes with root drive if not present.
 * @returns {Object} file system object
 */
function getFileSystem() {
  const fsJson = localStorage.getItem(FS_KEY);
  if (!fsJson) {
    const initialFS = { 'C:\\': [] };
    localStorage.setItem(FS_KEY, JSON.stringify(initialFS));
    return initialFS;
  }
  return JSON.parse(fsJson);
}

/**
 * Save the file system object to localStorage.
 * @param {Object} fs 
 */
function saveFileSystem(fs) {
  localStorage.setItem(FS_KEY, JSON.stringify(fs));
}

/**
 * Ensure all directories in the given directory path exist.
 * Creates missing directories along the path.
 * @param {string} dirPath Directory path to ensure exists
 * @returns {string} Normalized directory path
 */
function ensurePathExists(dirPath) {
  const fs = getFileSystem();
  const parts = dirPath.split('\\').filter(p => p !== '');
  let currentPath = parts[0] + '\\'; // e.g. C:\

  for (let i = 1; i < parts.length; i++) {
    if (!fs[currentPath]) {
      fs[currentPath] = [];
    }
    const nextDir = parts[i] + '\\';
    // Use case-insensitive check
    if (!fs[currentPath].some(entry => entry.toUpperCase() === nextDir.toUpperCase())) {
      fs[currentPath].push(nextDir);
    }
    currentPath += nextDir;
  }
  if (!fs[currentPath]) {
    fs[currentPath] = [];
  }
  saveFileSystem(fs);
  return currentPath.toUpperCase();
}

/**
 * List contents of directory at path.
 * @param {string} path Directory path (optional, defaults to C:\)
 * @returns {string|string[]} List of entries or error message
 */
function ls(path = 'C:\\') {
  path = normalizePath(path);
  const fs = getFileSystem();
  if (!fs[path]) {
    return `ls: cannot access '${path}': No such file or directory`;
  }
  return fs[path].join('\n');
}

/**
 * Create a new directory inside the given directory path.
 * @param {string} path Directory path where to create new directory
 * @param {string} dirName Name of new directory
 * @returns {string} Success or error message
 */
function mkdir(path, dirName) {
  path = normalizePath(path);
  const fs = getFileSystem();
  if (!fs[path]) {
    return `mkdir: cannot create directory '${dirName}': No such file or directory`;
  }
  const newDir = dirName.toUpperCase() + '\\';
  if (fs[path].some(entry => entry.toUpperCase() === newDir)) {
    return `mkdir: cannot create directory '${dirName}': File exists`;
  }
  fs[path].push(newDir);
  fs[newDir] = [];
  saveFileSystem(fs);
  return `Directory '${dirName}' created in '${path}'`;
}

/**
 * Create a new empty file inside the given directory path.
 * @param {string} path Directory path where to create file
 * @param {string} fileName Name of the file
 * @returns {string} Success or error message
 */
function touch(path, fileName) {
  path = normalizePath(path);
  ensurePathExists(path);
  const fs = getFileSystem();
  if (!fs[path]) {
    return `touch: cannot create file '${fileName}': No such file or directory`;
  }
  // Case-insensitive check for existing file or directory
  if (fs[path].some(entry => entry.toUpperCase() === fileName.toUpperCase() || entry.toUpperCase() === (fileName.toUpperCase() + '\\'))) {
    return `touch: cannot create file '${fileName}': File exists`;
  }
  fs[path].push(fileName);
  saveFileSystem(fs);
  return `File '${fileName}' created in '${path}'`;
}
window.touch = touch;

// console log the filesystem
//console.log(getFileSystem());
// create a file
//touch('C:\\', 'test.txt');
//console.log(getFileSystem());

// Export functions for external use
/**
 * Delete a file or folder at the given directory path.
 * @param {string} dirPath Directory path containing the item
 * @param {string} name Name of the file or folder to delete
 * @returns {string} Success or error message
 */
function deleteItem(dirPath, name) {
  dirPath = normalizePath(dirPath);
  const fs = getFileSystem();
  if (!fs[dirPath]) {
    return `delete: cannot delete '${name}': Directory does not exist`;
  }
  // Determine if deleting folder or file
  const folderName = name.toUpperCase() + '\\';
  const isFolder = fs[dirPath].some(entry => entry.toUpperCase() === folderName);
  if (isFolder) {
    // Recursive delete folder contents
    function recursiveDelete(path) {
      if (!fs[path]) return;
      fs[path].forEach(entry => {
        if (entry.endsWith('\\')) {
          recursiveDelete(path + entry.toUpperCase());
        }
      });
      delete fs[path];
    }
    recursiveDelete(dirPath + folderName);
    // Remove folder from parent directory
    fs[dirPath] = fs[dirPath].filter(entry => entry.toUpperCase() !== folderName);
  } else {
    // Delete file
    fs[dirPath] = fs[dirPath].filter(entry => entry.toUpperCase() !== name.toUpperCase());
  }
  saveFileSystem(fs);
  return `Deleted '${name}' from '${dirPath}'`;
}

export { ls, mkdir, touch, deleteItem };

