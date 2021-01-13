const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const uploadsDirPath = path.join(__dirname, "../public/uploads");

/**
 * Save files in uploads folder
 * @param {File} file - File
 * @param {String} dest - file will be saved in this folder
 * @returns path of saved file
 */
function saveFile(file, dest) {
  try {
    let destination = path.join(uploadsDirPath, dest);
    if (!fs.existsSync(destination))
      fs.mkdirSync(destination, { recursive: true });

    let fileName = uuidv4() + "_" + file.name;
    file.mv(path.join(uploadsDirPath, dest, fileName));
    return path.join("/uploads", dest, fileName);
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Delete file by given destination
 * @param {String} dest  file path
 * @returns {Boolean}  true else null
 */
function deleteFile(dest) {
  try {
    dest = dest.split("uploads/");
    let destination = path.join(
      uploadsDirPath,
      dest.length === 1 ? dest[0] : dest[1]
    ); // strange [0]->[1]

    if (fs.existsSync(destination)) fs.unlinkSync(destination);

    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Delete multiple files
 * @param {Array} arr - array of string that is file paths
 */
function deleteFiles(arr) {
  for (let i in arr) deleteFile(arr[i]);
}

module.exports = {
  saveFile,
  deleteFile,
  deleteFiles,
};
