var fs = require('fs');
var path = require('path');
var copyDereferenceSync = require('copy-dereference').sync

// global variables
var isWindows = process.platform === 'win32';
var options = {
  copyDereferenceSync: copyDereferenceSync,
  canSymLink: testCanSymLink(),
  fs: fs
};

var defaultOptions, testOptions;

function testCanSymLink() {
  var canLinkSrc = path.join(__dirname, "canLinkSrc.tmp");
  var canLinkDest = path.join(__dirname, "canLinkDest.tmp");

  try {
    fs.writeFileSync(canLinkSrc);
  } catch (e) {
    fs.unlinkSync(canLinkSrc);
    return false;
  }

  try {
    fs.symlinkSync(canLinkSrc, canLinkDest, 'file');
  } catch (e) {
    fs.unlinkSync(canLinkSrc);
    return false;
  }

  fs.unlinkSync(canLinkSrc);
  fs.unlinkSync(canLinkDest);

  return true;
}


module.exports = symlinkOrCopy

function symlinkOrCopy() {
  throw new Error("This function does not exist. Use require('symlink-or-copy').sync")
}

module.exports.setOptions = setOptions

function setOptions(newOptions) {
  if (newOptions == null) {
    options = defaultOptions;    
  } else {
    options = newOptions;
  }
}

module.exports.sync = symlinkOrCopySync

function symlinkOrCopySync(srcPath, destPath) {
  if (!options.canSymLink) {
    options.copyDereferenceSync(srcPath, destPath)
  } else {
    var type = null;
    var stat = options.fs.lstatSync(srcPath);
    if (stat.isSymbolicLink() || isWindows) {
      // We always want to use realPathSync() on windows since process.cwd() can
      // contain symlink components. See else if clause.

      // When we encounter symlinks, follow them. This prevents indirection
      // from growing out of control.
      // Note: At the moment `realpathSync` on Node is 70x slower than native,
      // because it doesn't use the standard library's `realpath`:
      // https://github.com/joyent/node/issues/7902
      // Can someone please send a patch to Node? :)

      var realPath = options.fs.realpathSync(srcPath);

      if (realPath !== srcPath) { // only extra stat if the path has changed
        stat = options.fs.statSync(realPath);
      }

      type = stat.isDirectory() ? 'junction' : 'file';
      srcPath = realPath;
    } else if (srcPath[0] !== '/') {
      // Resolve relative paths.
      // Note: On Mac and Linux (unlike Windows), process.cwd() never contains
      // symlink components, due to the way getcwd is implemented. As a
      // result, it's correct to use naive string concatenation in this code
      // path instead of the slower path.resolve(). (It seems unnecessary in
      // principle that path.resolve() is slower. Does anybody want to send a
      // patch to Node?)
      srcPath = process.cwd() + '/' + srcPath
    }

    // The 'type' argument is only available on Windows and will be ignored 
    // on other platforms. Default value is 'null'.
    options.fs.symlinkSync(srcPath, destPath, type)
  }
}