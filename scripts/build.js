/**
 * @fileOverview build
 * @date 2023-03-14
 * @author poohlaha
 */
'use strict'

const shell = require('shelljs')
const fsExtra = require('fs-extra')
const path = require('path')

const skips = ['']
const outputDir = 'dist'
const outputPath = path.join(__dirname, '../', outputDir)

function build(packageName = '') {
  shell.exec(`swc ${packageName} -d ${outputDir}`)

  // 拷贝 package.json 到目录

  const packageJsonPath = path.join(__dirname, '../', packageName, 'package.json')
  const readMePath = path.join(__dirname, '../', 'README.md')
  const licensePath = path.join(__dirname, '../', 'LICENSE')
  const exportPath = path.join(__dirname, '../', packageName, 'export.d.ts')

  const outputPackageJsonPath = path.join(outputPath, 'package.json')
  const outputReadmePath = path.join(outputPath, 'README.md')
  const outputLicensePath = path.join(outputPath, 'LICENSE')
  const outputExportPath = path.join(outputPath, 'export.d')

  if (fsExtra.pathExistsSync(outputPackageJsonPath)) {
    fsExtra.removeSync(outputPackageJsonPath)
  }

  if (fsExtra.pathExistsSync(outputReadmePath)) {
    fsExtra.removeSync(outputReadmePath)
  }

  if (fsExtra.pathExistsSync(outputLicensePath)) {
    fsExtra.removeSync(outputLicensePath)
  }

  // 删除 export.d.js, 拷贝 export.d.ts
  if (fsExtra.pathExistsSync(`${outputExportPath}.js`)) {
    fsExtra.removeSync(`${outputExportPath}.js`)
  }

  fsExtra.copySync(packageJsonPath, outputPackageJsonPath)
  fsExtra.copySync(readMePath, outputReadmePath)
  fsExtra.copySync(licensePath, outputLicensePath)
  fsExtra.copySync(exportPath, `${outputExportPath}.ts`)
}

function run() {
  fsExtra.removeSync(outputPath)
  build('jet')
}
module.exports = run()
