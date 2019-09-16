// Global app controller

//IMPORTAR
//cuando importamos en este caso toma el default export como valor
//import string from './models/Search';
//como hay varios valores a importar le indicamos cuales son los que queremos importar
//import { add, multiply, ID } from './views/searchView';
//console.log(`using imported functions ${sumar(ID, 3)} and ${multiplicar(3, 5)}. ${string}`);
//tambien podemos cambiarle el nombre a las funciones y valores que estamos importando
//import { add as sumar, multiply as multiplicar, ID } from './views/searchView';
//console.log(`using imported functions ${sumar(ID, 3)} and ${multiplicar(3, 5)}. ${string}`);
//tambien podemos importar todo el contenido
//import * as searchView from './views/searchView';
//console.log(`using imported functions ${searchView.add(searchView.ID, 3)} and ${searchView.multiply(3, 5)}. ${string}`);


//APP
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader} from './views/base';


/**Global State of the app
 * - Search Object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

/**
 * SEARCH CONTROLLER 
 */
const controlSearch = async () => { // como vamos a trabajar con promesas la funcion debe ser async
    // 1) Get query from view
    const query = searchView.getInput();
    
    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for Results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults(); // espera por una respuesta de la promesa de getResults del metodo de la clase Search
    
            // 5) Render results on UI
            clearLoader();
            // para el paginado le agregamos dos parametros, como tienen default aqui no los usamos, si no cuando llamemos la funcion de render en la paginacion
            searchView.renderResults(state.search.result);
        } catch(error) {
            alert('No se pudo cargar la lista :(');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

//EVENT DELEGATION
// se usa para evaluar donde se hizo click y para realizar una funcion asociada a ese evento y ese elemento
// para empezar hay que verificar donde occurrio el evento, ya que hay varios elementos dentro del mismo objeto al que se le ha hecho target
// como un elemento puede estar formado por varios elementos tenemos que buscar la forma seleccionar el elemento que nos interesa
//por ejemplo el boton que estamos seleccionando esta compuesto por un button, svg y span dependiendo de donde se haga el click entonces el target sera ese elemento
//resolvemos esto haciendo uso de closest , entonces cualquier elemento al que le hagamos click dentro de este elemento el target sera el elemento que le estamos indicando
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) { 
        //aqui capturamos la informacion que almacenamos en nuestro "expando attribute" con "dataset"
        // como el dataset devuelve un str lo llevamos a int
        const goToPage = parseInt(btn.dataset.goto, 10); // el 10 es un parametro de la funcion para indicar el tipo de numero
        //limpiamos la lista antes de hacer el render de la siguiente pagina
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage); //aqui le indicamos la pagina a donde vamos a ir
    };
});



/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    //window.location es la URL completa, window.location.hash es el valor del #
    const id = window.location.hash.replace('#', ''); //borramos el # para quedarnos solo con el numero

    if (id) {
        //Prepara UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        //resaltamos el objeto que fue seleccionado de la lista con una clase
        if (state.search) searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);

        //Get recipe data
        //normalmente todas las promesas conviene esperarlas en un try/catch ya que pueden resultar en un error
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                //este otro parametro es para verificar si la receta esta en la lista de likes, de ser asi cambia el corazon
                state.likes.isLiked(id)
            );
        }catch(error) {
            //Las alertas conviene hacerlas mas atractivas, usando modals popups
            alert('No se pudo cargar la receta');
        }
    }
};

//el hashchange es un evento que corresponde a la url, cada vez que presionamos una receta de la lista le pasa a la url un # con el numero de la receta
//con este listener lo que hacemos es indicarle que este atento a cuando este cambio ocurra para que ejecute una funcion 
//window.addEventListener('hashchange', controlRecipe);

//en caso de que refresque la pagina verificamos nuevamente la url para cargar la receta que tenia cargada
//window.addEventListener('load', controlRecipe);

//ya que tenemos la misma funcion para dos eventos diferentes podemos crear el listener de la siguiente manera
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));




/**
 * LIST CONTROLLER
 */
const controlList = () => {
    //Create a new list if there is none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el =>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Manejar eventos de actualizar y borrar elementos de la lista
elements.shopping.addEventListener('click', e =>{
    //donde sea que le hagamos click dentro del elemento shopping__item vamos a obtener el valor del dataset
    //necesitamos el id que almacenamos en el dataset cuando insertamos el html
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Boton de borrar
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);

        //actualizar cantidades en el state
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/**
 * LIKE CONTROLLER
 */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;
    
    //El usuario aun no ha dado like 
    if (!state.likes.isLiked(currentId)){
        //Agregar like al state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggle like button
        //despues de que le da click al boton le cambiamos el icon por el de el corazon relleno
        likesView.toggleLikeBtn(true);

        //Add like al UI
        likesView.renderLike(newLike);
        
    } else {// si el usuario ya eligio alguna receta
        // Remove like del state
        state.likes.deleteLike(currentId);
        //Toggle like button
        //despues de que le quita el like le cambiamos el corazon por el que no tiene relleno
        likesView.toggleLikeBtn(false);
        
        //Remove like del UI
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


//Volver a llenar la pagina de likes al refrescar la pagina
window.addEventListener('load', () => {
    state.likes = new Likes();
    //Restore likes
    state.likes.readStorage();

    //Togge like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});



//Handling recipe button clicks (EVENT HANDLING) (event delegation )
//si se hace click en alguno de los elementos de "recipe" entonces enviamos el evento al callback
//si resulta ser que ese click fue sobre uno de los botones de increase o decrease entonces iniciamos la actualizacion
//a diferencia del event handler anterior donde le indicabamos que debia seleccionar el elemento mas cercano (closest) a donde se habia hecho click
//la diferencia es que anteriormente sabiamos cual es el elemento aqui hay varios elementos asi que verificamos todos los clicks 
elements.recipe.addEventListener('click', e => {
    //en caso de que el click sea sobre el elemento que le indicamos o cualquiera de sus hijos "*"
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease butto is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase butto is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});
