//si queremos exportar varias cosas a la vez en lugar de default usamos export 
//export const add = (a, b) => a + b;
//export const multiply = (a, b) => a * b;
//export const ID = 23;



//APP
import { elements } from './base';

// Obtenemos lo que fue escrito en el input de busqueda
export const getInput = () => elements.searchInput.value;

// limpiamos el input
export const clearInput = () => {elements.searchInput.value = '';};

//limpiamos todos los resultados
export const clearResults = () => {
    elements.searchResList.innerHTML = ''; //la lista de recetas
    elements.searchResPages.innerHTML = ''; //los botones del navegador
};

//esta funcion es para agregarle una clase al item seleccionado asi tiene un estado activo
export const highlightSelected = id => {
    //antes de agregar la clase devemos removerla de todas las demas
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });

    //este selector me ayuda a verificar si el atributo del item corresponde con el id que le estamos pasando, que es el mismo que estamos usando para cargar la informacion
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
};



//Funcion para limitar el titulo a un largo maximo para los casos de titulos largos
//la dificultad mayor esta en que al hacer esto no cortemos palabras, ademas de que vamos a sustituir el resto por ...
/**
 * EJEMPLO DEL ALGORITMO POR CADA ITERACION 
 * Titulo: Pasta with tomato and spinach
 * acumulador: 0 / acc + cur.length = 5 / newTitle = Pasta
 * acumulador: 5 / acc + cur.length = 9 / newTitle = Pasta with
 * acumulador: 9 / acc + cur.length = 15 / newTitle = Pasta with tomato
 * acumulador: 15 / acc + cur.length = 18 / newTitle = Pasta with tomato
 * acumulador: 18 / acc + cur.length = 24 / newTitle = Pasta with tomato
 * 
 */
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = []; // los const de tipo array se le pueden hacer push
    if(title.length > limit) {
        //dividimos el string en palabras usando los espacios
        //acc = acumulador & cur = current
        title.split(' ').reduce((acc, cur) => { //reduce usa un callback para ello insertamos una funcion anonima, ademas incluye un acumulador asi no tenemos que usar una variable externa para llevar la cuenta
            //cur es la palabra actual que estamos evaluando, en cada iteracion verificaremos el largo de la palabra sumando el total ya anexado
            if(acc + cur.length <= limit) { //el total de esto es mayor o igual al limite?
                newTitle.push(cur); //si no supera el limite hacemos push de la palabra
            }
            return acc + cur.length; //este return es el resultado del callback o en este caso la funcion anonima que incrementara el acumulador del metodo reduce para la siguiente iteracion
        }, 0); //0 es desde donde arranca el acumulador, que usaremos para verificar si la siguiente palabra supera el limite
        return `${newTitle.join(' ')} ...`; //join concatena usando el valor dentro del parentesis, y le sumamos los ... al final
    }
    return title
}

//insertamos un bloque de html en el index.html por cada elemento que llama esta funcion
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${limitRecipeTitle(recipe.title)}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

//BOTONES NEXT PREVIUS
// type = next / prev
//el elemento button tiene una propiedad llamada data-goto, esas propiedades son personalizables
//anteponiendo la palabra data-xxxxx podemos almacenar informacion ahi para usarla posteriormente
// este tipo de propiedades se llaman "expando attributes"
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

//PAGINACION
const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        //Buton to go to next page 
        button = createButton(page, 'next');
    } else if (page < pages) {
        //buttons to next an previus pages
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')}
        `;
    } else if (page === pages && pages > 1) {
        //only button to go to the previus page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

//por cada elemento del array resultante de la busqueda corremos la funcion que inserta el html dentro del index.html
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //publicamos en grupos para la paginacion
    const start = (page -1) * resPerPage;
    const end = page * resPerPage;

    //automaticamente envia el objeto completo de cada resultado a la funcion que insertara el bloque de codigo en el index.html
    recipes.slice(start, end).forEach(renderRecipe);

    //llamamos los botones de la paginacion
    renderButtons(page, recipes.length, resPerPage);
};

