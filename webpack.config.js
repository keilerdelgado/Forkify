const path = require('path');
//instalamos por npm el plugin y lo incluimos dentro del proyecto
//este plugin nos permite que asi como enviamos el contenido js de dev a prod tambien lo hacemos con los archivos de html cuando corremos cualquiera de los scripts (dev-build-start)
//inclusive agrega la etiqueta <script src"xxxxx"> al html de prod
const HtmlWebpackPlugin = require('html-webpack-plugin');

//el webpack nos permite tener dos carpeta unas de dev y otra de prod, cada vez que ejecutamos el comando de build envia los archivos a produccion
module.exports = {
    //src es la carpeta donde van los archivos que usaremos para desarrollo (development)
    entry: ['babel-polyfill', './src/js/index.js'],
    output: {
        //una vez compilados la informacion se guardara en la carpeta dist
        path: path.resolve(__dirname, 'dist'),
        //y se guardara en el archivo de nombre
        filename: 'js/bundle.js'
    },
    //devServer se usa como un live server que cada vez que guardo actualiza compila y abre el archivo en el navegador
    //una vez abierto en el navegador cada vez que guardemos el script "start" se ejecuta automaticamente y se genera los archivos temporales con la informacion de los archivos que se enviaran al prod
    //el archivo se abre como si fuera un servidor, no como si fuera un archivo
    //para configurar el watch indicamos el flag --open en el .package.json
    devServer: {
        //dist es la carpeta donde estara el archivo que usaremos para el sitio (produccion)
        contentBase: './dist'
    },
    //es un array con los parametros de los plugins instalados en nuestro proyecto
    plugins: [
        //Este plugin funciona como una clase
        new HtmlWebpackPlugin({
            //archivo de entrada
            filename: 'index.html',
            //archivo de salida (si no existe lo crea)
            template: './src/index.html'
        })
    ],
    //babel
    module: {
        rules: [
            // es una especie de autoloader, vamos a cargar a todos los archivos que indiquemos en "test"
            {
                //todos los archivos que terminan en .js (expresion irregular)
                test: /\.js$/,
                //excluimos todos los archivos que no necesitamos procesar (expresion irregular)
                exclude: /node_modules/,
                use: {
                    //babel necesita un archivo de configuracion
                    loader: 'babel-loader'
                }
            }
        ]
    }
};