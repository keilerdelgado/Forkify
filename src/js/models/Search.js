//EXPORT DEFAULT
//export default ejecuta inmediatamente el codigo cuando es importado en otro archivo
//export default 'I am an export string.';


//APP
import axios from 'axios'; //con los npm no hace falta indicar la ruta
//axios es como un fetch pero funciona para todos los browsers
//y regresa json de una vez, asi que no hace falta usar el json.parse

//nos traemos los datos necesarios para hacer la consulta en la api
import { key, proxy } from '../config';

export default class Search {
    constructor(query){
        this.query = query;   
    }
    async getResults(){
        
        try { 
            const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`)
            this.result = res.data.recipes;
        } catch(error) {
            alert(error);
        }
    }
}



