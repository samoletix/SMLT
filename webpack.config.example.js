/*
 * Webpack Configuration Example
 * 
 * This is an example configuration for when build tools are added in Phase 6.
 * To use this configuration:
 * 1. Rename to webpack.config.js
 * 2. Install dependencies: npm install --save-dev webpack webpack-cli babel-loader @babel/core @babel/preset-env style-loader css-loader
 * 3. Update package.json scripts
 * 4. Update index.html to use dist/bundle.js instead of js/app.js
 */

const path = require('path');

module.exports = {
    // Entry point - main application file
    entry: './js/app.js',

    // Output configuration
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Clean dist folder before each build
    },

    // Module rules for different file types
    module: {
        rules: [
            {
                // JavaScript files
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                // CSS files
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                // Image files
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                // Font files
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ]
    },

    // Development mode with source maps
    mode: 'development',
    devtool: 'source-map',

    // Development server configuration
    devServer: {
        static: {
            directory: path.join(__dirname, '.'),
        },
        compress: true,
        port: 8080,
        hot: true,
        open: true,
    },

    // Optimization for production
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },

    // Resolve extensions
    resolve: {
        extensions: ['.js', '.json'],
    },
};

// Production configuration
const productionConfig = {
    mode: 'production',
    devtool: false, // No source maps in production
    performance: {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
};

// To use this configuration:
// 1. Create webpack.config.js from this example
// 2. Add to package.json scripts:
//    "dev": "webpack serve --config webpack.config.js",
//    "build": "webpack --config webpack.config.js --mode production"
// 3. Run: npm run dev (development) or npm run build (production)