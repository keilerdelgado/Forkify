import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`)
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients; 
        } catch (error) {
            console.log(error);
            alert('Hubo un error :(')
        }
    }

    calcTime() {
        //como no tenemos el tiempo estimado, podemos hacerlo calculandolo por encima, en este caso, por cada 3 ingredientes 15 minutos
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        //como no tenemos la cantidad estimada partimos de un numero de 4 personas para cada receta
        this.servings = 4;
    }

    parseIngredients(){
        //la idea es organizar la informcion de los ingredientes que recibimos del fetch
        //guardamos en un array todas las unidades posibles, para despues indicarle cual sera la unidad que recibira segun sea el caso
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        //lo dejamos aparte ya que los arrays anteriores son para abreviar y usamos el de abajo para la funcion
        const units = [...unitsShort, 'kg', 'gr']; //los ... guardan cada elemento del array dentro de este array, si no fuera asi entonces esto resultaria en un array bidimensional

        const newIngredients = this.ingredients.map(el => {
            //la funcion map hace un foreach con cada elemento (el) del array y lo guarda en un nuevo array
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            
            // 2) Remove parentheses
            //este fetch devuelve los ingredientes con informacion adicional entre parentesis, por eso los eliminamos
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredientes into count, unit, and ingredients
            const arrIng = ingredient.split(' ');
            //el metodo findindex recorre un array buscando el str que le indiquemos y devuelve el index donde obtenga el true
            //tambien podemos correr un callback por cada elemento, como es este caso, el callback debe devolver true o false para que funcione el findindex
            //includes verifica si un array incluye un valor y devuelve true
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //encontro alguna de las unidades en el array
                const arrCount = arrIng.slice(0, unitIndex); //como las primeras posicions son el numero y luego viene la unidad indicamos que desde el 0 hsta donde encontro la unidad sera la medida
                
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+')); // algunas medidas incluyen un - en lugar de un espacio asi que lo sustituimos por un + para que tenga el mismo formato que los demas y nos sriva para el eval
                } else {
                    //eval hace el calculo de los valores (4+1/2 = 4.5)
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(arrIng[0], 10)){//si el primer item del array es un numero
                //no hay ninguna unidad pero el primer elemento es un numero
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    //extraemos el numero del resto y unimos todo lo demas en un string
                    ingredient: arrIng.slice(1).join(' ') //en el slice si no indicamos el segundo parametro lo hace desde ahi hasta el final  
                }
                
            } else if (unitIndex === -1) {
                //no encontro ninguna de las unidades en el array y el primer item del array no es un numero 
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            //el callback que le estamos aplicando a cada elemento tiene que tener un return, que es lo que se almacenara en el nuevo array en la posicion i
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {//type es para saber si debemos restar u sumar cantidades segun la solicitud del usuario
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        //al ser llamado este metodo se actualizan los servings en el objeto state donde estamos almacenando la informacion
        this.servings = newServings;
    };
}