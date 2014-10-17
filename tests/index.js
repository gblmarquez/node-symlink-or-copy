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
      isTest: true,
      canSymLink: false,
      canLink: false
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
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          };
        },
        realpathSync: function() {count++;},
        symlinkSync: function() {count++;},
        linkSync: function() {count++;}
      },
      isTest: true,
      canSymLink: true,
      canLink: true
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
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          };
        },
        realpathSync: function() {count++},
        symlinkSync: function() {count++;},
        linkSync: function() {count++;}
      },
      isTest: true,
      canSymLink: true,
      canLink: true
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 4);
  });
  
  it('windows should use symlinks for directory', function() {
    var count = 0,
        countDir = 0;
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
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          };
        },
        realpathSync: function() {count++;},
        symlinkSync: function() {countDir++;},
        linkSync: function() {count++;}
      },
      isTest: true,
      canSymLink: true,
      canLink: true
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 3);
    assert.equal(countDir, 1);
  });
  
  it('windows should use hardlinks for files', function() {
    var count = 0,
        countFile = 0;
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
              return false;
            }
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return false;
            }
          };
        },
        realpathSync: function() {count++;},
        symlinkSync: function() {count++;},
        linkSync: function() {countFile++;}
      },
      isTest: true,
      canSymLink: true,
      canLink: true
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 3);
    assert.equal(countFile, 1);
  });  
  
  it('windows should use copy files when hardlinks are not available', function() {
    var count = 0,
        countCopy = 0;
    symLinkOrCopy.setOptions({
      copyDereferenceSync: function() {countCopy++;},
      fs: {
        lstatSync: function() {
          return {
            isSymbolicLink: function() {
              count++;
              return true;
            },
            isDirectory: function() {
              count++;
              return false;
            }
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return false;
            }
          };
        },
        realpathSync: function() {count++;},
        symlinkSync: function() {count++;},
        linkSync: function() {count++;}
      },
      isTest: true,
      canSymLink: true,
      canLink: false
    });
    
    symLinkOrCopy.sync();
    assert.equal(count, 3);
    assert.equal(countCopy, 1);
  });
  
});

describe('testing mode', function() {
    
  it('allows fs to be mocked', function() {
    var count = 0;
    symLinkOrCopy.setOptions({
      isTest: true,
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
          };
        },
        statSync: function() {
          return {
            isDirectory: function() {
              count++;
              return true;
            }
          };
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
