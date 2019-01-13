const nodeExternals = require('webpack-node-externals');
const path          = require('path');

module.exports = {
	target: 'node', // webpack should compile node compatible code
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	entry: './js/index.js',
	mode: 'production',
	node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            },
            { test: /\.css$/, loader: 'null-loader' },
            {
                // Load all images as base64 encoding if they are smaller than 8192 bytes
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // On development we want to see where the file is coming from, hence we preserve the [path]
                            name: '[path][name].[ext]?hash=[hash:20]',
                            limit: 8192
                        }
                    }
                ]
            }
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, './js'), 'node_modules'],
        alias: {
            'img'    : path.join(__dirname, './assets/img'),
            'stores' : path.join(__dirname, './js/stores')
        }
    },
};