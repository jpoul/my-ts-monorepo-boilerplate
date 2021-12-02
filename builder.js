const { argv } = require('process');

var builder = (function () {
    const { esbuildPluginNodeExternals } = require('esbuild-plugin-node-externals')
    const { build: esbuild } = require('esbuild')
    const clean = require('esbuild-plugin-clean')
    const gen = require('dts-bundle-generator')
    const fs = require("fs")
    const path = require("path")

    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath)
        arrayOfFiles = arrayOfFiles || []
        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file))
            }
        })
        return arrayOfFiles
    }

    const paths = {
        package: path.join(process.cwd(), 'package.json'),
        sourceFolder: path.join(process.cwd(), 'src'),
        outputFolder: path.join(process.cwd(), 'dist'),
        tsConfig: path.join(process.cwd(), 'tsconfig.json'),
    }
    paths.indexFilePath = path.join(paths.sourceFolder, 'index.ts')
    paths.declarationFilePath = path.join(paths.outputFolder, 'index.d.ts')

    function getBuildConfig(env) {
        const config = {
            entryPoints: getAllFiles(paths.sourceFolder),
            minify: true,
            sourcemap: false,
            platform: "node",
            bundle: true,
            outdir: paths.outputFolder,
            plugins: [
                clean.default({
                    patterns: [path.join(paths.outputFolder, '*')]
                }),
                esbuildPluginNodeExternals({
                    packagePaths: paths.package
                })
            ],
            logLevel: "debug"
        }
        if (env) {
            config.define = { "process.env.NODE_ENV": env }
        }
        return config
    }

    function build(env) {
        esbuild(getBuildConfig(env)).then(() => {
            const dtsBundle = gen.generateDtsBundle([{
                filePath: paths.indexFilePath,
                outFile: paths.declarationFilePath
            }])
            fs.writeFileSync(paths.declarationFilePath, dtsBundle[0])
        })

    }

    return {
        paths: paths,
        getConfig: getBuildConfig,
        build: build
    }
})();

if (argv[2] === 'run') {
    builder.build(argv[3])
}