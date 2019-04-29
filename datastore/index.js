const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Helper function

function todoFilePath(id) {
  return path.join(exports.dataDir, id + '.txt')
}

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw err;
    } else {
      items[id] = text;
      fs.writeFile(todoFilePath(id), text, (err) => {
        if (err) {
          callback(err)
        } else {
          callback(null, { id, text });
        }
      })
    }
  });

};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else if (!files) {
      callback(null, [])
    } else {
      Promise.all(_.map(files, (fileName) => {
        var id = fileName.split('.txt')[0]
        return new Promise((resolve, reject) => {
          fs.readFile(todoFilePath(id), (err, todoBuff) => {
            if (err) {
              reject(err)
            } else {
              resolve({ id, text: String(todoBuff) })
            }
          })
        })
      })).then(todos => callback(null, todos))
    }
  })
};

exports.readOne = (id, callback) => {
  fs.readFile(todoFilePath(id), (err, buff) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: String(buff) });
    }
  })
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, _todo) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(todoFilePath(id), text, (err) => {
        if (err) {
          callback(err)
        } else {
          callback(null, { id, text });
        }
      })
    }
  })
};

exports.delete = (id, callback) => {
  exports.readOne(id, (err, _todo) => {
    if (err) {
      callback(err);
    } else {
      fs.unlink(todoFilePath(id), (err) => {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      })
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
