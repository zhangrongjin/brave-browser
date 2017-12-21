const path = require('path')
const program = require('commander');
const fs = require('fs-extra')
const config = require('../lib/config')
const util = require('../lib/util')

const projectNames = config.projectNames.filter((project) => config.projects[project].ref)

console.log("sync.js: projectNames=", projectNames);

program
  .version(process.env.npm_package_version)
  .option('--gclient_file <file>', 'gclient config file location')
  .option('--run_hooks', 'run gclient hooks')
  .option('--run_sync', 'run gclient sync')
  .option('--submodule_sync', 'run submodule sync')
  .option('--init', 'initialize all dependencies')
  .option('--all', 'update all projects')
  .option('--android', 'initialize android dependencies')
projectNames.forEach((project) => {
  program.option('--' + project + '_ref <ref>', project + ' ref to checkout')
})

console.log("sync.js: process.argv=", process.argv);
program.parse(process.argv)
config.update(program)

//lets force it for now
program.android = true;


if (config.android) {
  console.log("sync.js: config.android true");
} else {
  console.log("sync.js: config.android false");
}
console.log("sync.js: program.android=", program.android);
console.log("sync.js: program.init=", program.init);
console.log("sync.js: program.submodule_sync=", program.submodule_sync);
console.log("sync.js: program.all=", program.all);

console.log("sync.js: config.projectNames=", config.projectNames);
console.log("sync.js: config.projects=", config.projects);

if (program.init || program.submodule_sync) {
  util.submoduleSync()
}

if (program.init) {
  util.installPrereqs();
}

if (program.init) {
  util.buildGClientConfig()
}

//TODO, AB: move inside util.buildGClientConfig() ? - done
// if (program.android) {
//   util.addAndroidTarget();
// }

if (program.android) {
   util.installBuildAndroidDeps();
}

if (program.init) {
  util.gclientSync()
}


let updatedVersion = false

projectNames.forEach((project) => {
  if (program.init || program.all || program[project + '_ref']) {
    updatedVersion = true
    util.setDepVersion(config.projects[project].dir, config.projects[project].ref)
  }
})

if (updatedVersion || program.init || program.run_sync) {
  util.gclientSync()
}

if (updatedVersion || program.init || program.run_hooks) {
  util.gclientRunhooks()
}
