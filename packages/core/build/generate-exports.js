const fs = require('fs')

// Recursive function to get files
function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}

const result = {};

for (const file of getFiles('./src')) {
    const origin = file.replace('./src/', '').replace('.ts', '');
    const exported = file.replace('./src/', './lib/').replace('.ts', '.js');

    result["./" + origin] = exported;
    result["./" + origin  + ".js"] = exported;

    // if ends to index
    if (origin.endsWith('/index')) {
        const originWithoutIndex = origin.replace('/index', '');

        result["./" + originWithoutIndex] = exported;
    }
}

console.log(JSON.stringify(result, null, 2));