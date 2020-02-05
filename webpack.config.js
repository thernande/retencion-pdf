const { VueLoaderPlugin } = require('vue-loader')



module.exports = {
    entry: "./src/pdf/app.js",
    output: {
        path: __dirname + '/src/public/js',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js*/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                ,
                }
            },
            {
                test: /\.vue*/,
                use: {
                    loader: "vue-loader"
                
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};