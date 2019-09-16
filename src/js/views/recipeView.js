import { elements } from './base';
//libreria para crear fracciones de los numero decimales ej: 0.25 = 1/4
import { Fraction } from 'fractional'; //como esta instalado en node no necesita una ruta

//antes de cargar la view limpiamos la que ya estaba, si es que habia alguna
export const clearRecipe = () => {
    elements.recipe.innerHTML = '';
}

const formatCount = count => {
    if(count) {
        //esta cuenta ayuda a redondear las fracciones para no tener numeros como 0.3333333333333333
        const newCount = Math.round(count * 10000) / 10000;
        // count = 2.5 --> 2 1/2
        // count = 0.5 --> 1/2
        //-----Destructuring assignment
        //[a,b] = [10, 20]
        //split divide en dos el numero por el "." del decimal, split genera un array ese array lo pasamos por map para convertir cada valor a int de nuevo 
        const [int, dec] = newCount.toString().split('.').map(el => parseInt(el,10));

        //si no hay decimales entonces devolvemos la cuenta ya que es un valor entero
        if (!dec) return newCount;

        //ya que si hay decimales, entonces verificamos si es inferior a 1 verificando si el valor de int es igual a 0
        if (int === 0) {
            //en caso de que sea igual a cero utilizamos la libreria que importamos, donde le entregamos el numero completo y nos devolvera un numerador y un denominador
            const fr = new Fraction(newCount);
            return `${fr.numerator}/${fr.denominator}`;
        } else {
            //en caso de que no empiece por 0 entonces vamos a utilizar la parte fraccionada, descontamos int para que nos quede cero, ya que int es el valor entero de la medida
            //luego lo que nos quede pasara por la libreria y nos devolvera la fraccion de esa medida
            const fr = new Fraction(newCount - int);
            return `${int} ${fr.numerator}/${fr.denominator}`;
        }
    };
    return '?'; //en caso de que no haya ninguna medidda devuelve un signo "?"
};

const createIngredient = ingredient => `
    <li class="recipe__item">
        <svg class="recipe__icon">
            <use href="img/icons.svg#icon-check"></use>
        </svg>
        <div class="recipe__count">${formatCount(ingredient.count)}</div>
        <div class="recipe__ingredient">
            <span class="recipe__unit">${ingredient.unit}</span>
            ${ingredient.ingredient}
        </div>
    </li>
`;

export const renderRecipe = (recipe, isLiked) => {
    const markup = `
        <figure class="recipe__fig">
            <img src="${recipe.img}" alt="${recipe.title}" class="recipe__img">
            <h1 class="recipe__title">
                <span>${recipe.title}</span>
            </h1>
        </figure>
        <div class="recipe__details">
            <div class="recipe__info">
                <svg class="recipe__info-icon">
                    <use href="img/icons.svg#icon-stopwatch"></use>
                </svg>
                <span class="recipe__info-data recipe__info-data--minutes">${recipe.time}</span>
                <span class="recipe__info-text"> minutes</span>
            </div>
            <div class="recipe__info">
                <svg class="recipe__info-icon">
                    <use href="img/icons.svg#icon-man"></use>
                </svg>
                <span class="recipe__info-data recipe__info-data--people">${recipe.servings}</span>
                <span class="recipe__info-text"> servings</span>

                <div class="recipe__info-buttons">
                    <button class="btn-tiny btn-decrease">
                        <svg>
                            <use href="img/icons.svg#icon-circle-with-minus"></use>
                        </svg>
                    </button>
                    <button class="btn-tiny btn-increase">
                        <svg>
                            <use href="img/icons.svg#icon-circle-with-plus"></use>
                        </svg>
                    </button>
                </div>

            </div>
            <button class="recipe__love">
                <svg class="header__likes">
                    <use href="img/icons.svg#icon-heart${isLiked ? '' : '-outlined'}"></use>
                </svg>
            </button>
        </div>



        <div class="recipe__ingredients">
            <ul class="recipe__ingredient-list">
                ${recipe.ingredients.map(el => createIngredient(el)).join(' ')}
            </ul>

            <button class="btn-small recipe__btn recipe__btn--add">
                <svg class="search__icon">
                    <use href="img/icons.svg#icon-shopping-cart"></use>
                </svg>
                <span>Add to shopping list</span>
            </button>
        </div>

        <div class="recipe__directions">
            <h2 class="heading-2">How to cook it</h2>
            <p class="recipe__directions-text">
                This recipe was carefully designed and tested by
                <span class="recipe__by">${recipe.author}</span>. Please check out directions at their website.
            </p>
            <a class="btn-small recipe__btn" href="${recipe.url}" target="_blank">
                <span>Directions</span>
                <svg class="search__icon">
                    <use href="img/icons.svg#icon-triangle-right"></use>
                </svg>

            </a>
        </div>
    `;
    elements.recipe.insertAdjacentHTML('afterbegin', markup);
}


export const updateServingsIngredients = recipe => {
    //update servings
    document.querySelector('.recipe__info-data--people').textContent = recipe.servings;
    
    //update ingredients
    const countElements = Array.from(document.querySelectorAll('.recipe__count'));
    countElements.forEach((el, i) => { // el = elemento, i = index del array
        el.textContent = formatCount(recipe.ingredients[i].count);
    });
};