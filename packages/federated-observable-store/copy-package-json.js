const fsPromises = require('fs').promises;

(async () => {
  await fsPromises.rm("lib", {recursive: true, force: true});
  await fsPromises.mkdir("lib");
  await fsPromises.copyFile("package.json", "lib/package.json");
})();
