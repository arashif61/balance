module.exports = [
    {
        target: 'electron-renderer',
        entry: "./src/main.js",
        output: {
            // 出力先のディレクトリ
            path: path.resolve(__dirname, "dest"),
            // 出力ファイル名
            filename: "bundle.js",
        },
        module: {
            rules: [{
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }]
        },
        devServer: {
            // webpackの扱わないファイル(HTMLや画像など)が入っているディレクトリ
            contentBase: path.resolve(__dirname, "public"),
        },
    }
]