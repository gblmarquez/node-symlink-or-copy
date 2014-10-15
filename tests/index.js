var assert = require('assert');

var symLinkOrCopy = require('..')


describe('node-symlink-or-copy', function() {
  beforeEach(function() {
    // disable test mode, by setting the default 
    symLinkOrCopy.setOptions(null);    
  });

  it('windows falls back to copy', function() {
    var count = 0;
  	symLinkOrCopy.setOptions({
      copyDereferenceSync: function() {
        count++;
      },
      canSymLink: false
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 1);
  });

  it('windows symlinks when has permission', function() {
    var count = 0;
    symLinkOrCopy.setOptions({
      fs: {
        lstatSync: function() {
          return {
            isSymbolicLink: function() {
              count++;
              return true;
            },
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        realpathSync: function() {count++},
        symlinkSync: function() {count++;}
      },
      canSymLink: true
    });
    symLinkOrCopy.sync();
    assert.equal(count, 4);
  });
  
  
  it('windows symlinks must check if it\'s directory of file', function() {
    var count = 0;
    symLinkOrCopy.setOptions({
      fs: {
        lstatSync: function() {
          return {
            isSymbolicLink: function() {
              count++;
              return true;
            },
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        realpathSync: function() {count++},
        symlinkSync: function() {count++;}
      },
      canSymLink: true
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 4);
  });
  
});

describe('testing mode', function() {
    
  it('allows fs to be mocked', function() {
    var count = 0;
    symLinkOrCopy.setOptions({
      canSymLink: true,
      fs: {
        lstatSync: function() {
          return {
            isSymbolicLink: function() {
              count++;
              return true;
            },            
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          }
        },
        realpathSync: function() {count++},
        symlinkSync: function() {count++;}
      }
    });

    assert.equal(count, 0);
    symLinkOrCopy.sync();
    assert.equal(count, 4);
  });
});