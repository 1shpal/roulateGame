var fs = require("fs");
var join = require('path').join;
const TerserPlugin = require("terser-webpack-plugin");
var Config = {};
// fs.readdirSync(join(__dirname, './public/frontend/script'))
//     .filter(file => ~file.search(/^[^\.].*\.js$/))
//     .forEach(function (file) {
//         Config[file.split('.')[0]] = './public/frontend/script/' + file
//     });

module.exports = {
    entry: {
        wallet: ['./public/frontend/script/deposit.js', './public/frontend/script/withdraw.js']
    },
    output: {
        path: __dirname + "/public/build",
        filename: 'roule.[name].min.js',
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                myCustomOption: true,
            },
            // Can be async
            minify: (file, sourceMap, minimizerOptions) => {
                // The `minimizerOptions` option contains option from the `terserOptions` option
                // You can use `minimizerOptions.myCustomOption`
                const extractedComments = [];

                // Custom logic for extract comments

                const { map, code } = require("uglify-js") // Or require('./path/to/uglify-module')
                    .minify(file, {
                        /* Your options for minification */
                    });

                return { map, code, extractedComments };
            },
        })],
    },
    resolve: {
        alias: {
            'jquery': require.resolve('jquery'),
        }
    }
};