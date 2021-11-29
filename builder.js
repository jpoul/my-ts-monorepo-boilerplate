const { argv } = require('process');

var builder = (function () {
    const p = require('path')
    const { esbuildPluginNodeExternals } = require('esbuild-plugin-node-externals')
    const { build: esbuild } = require('esbuild')
    const clean = require('esbuild-plugin-clean')
    const esbuildPluginTsc = require('esbuild-plugin-tsc');
    const { dtsPlugin } = require("esbuild-plugin-d.ts");

    const paths = {
        package: p.join(process.cwd(), 'package.json'),
        sourceFolder: p.join(process.cwd(), 'src'),
        outputFolder: p.join(process.cwd(), 'lib'),
        tsConfig: p.join(process.cwd(), 'tsconfig.json')
    }
    paths.entryPoint = p.join(paths.sourceFolder, 'index.ts')
    paths.outfile = p.join(paths.outputFolder, 'index.js')
    console.log(paths.tsConfig)
    const config = {
        entryPoints: [paths.entryPoint],
        minify: true,
        sourcemap: true,
        platform: "node",
        bundle: true,
        outfile: paths.outfile,
        plugins: [
            clean.default({
                patterns: [p.join(paths.outputFolder, '*')]
            }),
            esbuildPluginNodeExternals({
                packagePaths: paths.package
            }),
            // esbuildPluginTsc({
            //     tsconfigPath: paths.tsConfig
            //     // If true, force compilation with tsc
            // })
            dtsPlugin({ tsConfig: paths.tsConfig })
        ],
        logLevel: "debug"
    }

    function build(env) {
        if (env) {
            config.define = { "process.env.NODE_ENV": env }
        }
        esbuild(config).catch((error) => {
            console.error(error)
            process.exit(1)
        })
    }

    return {
        paths: paths,
        config: config,
        build: build
    }
})();

//console.table(config)
if (argv[2] === 'run') {
    builder.build(argv[3])
}