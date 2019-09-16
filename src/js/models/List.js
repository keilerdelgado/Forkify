import uniqid from 'uniqid';

export default class List {
    constructor(){
        //en esta variable vamos a ir almacenando los resultados
        this.items = [];
    }

    addItem(count, unit, ingredient){
        //adicionalmente para poder manejar los items que vayamos agregando vamos a agregarle un ID unico
        //eso lo vamos a hacer haciendo uso de una libreria (uniqid)
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem (id){
        //vamos a saber cual es el index
        //find index ejecunta una funcion anonima por cada elemento y cuando retorna true entonces ese index se almacena en la variable
        const index = this.items.findIndex(el => el.id === id);
        // usamos splice para eliminar el item del array
        //splice vs slice
        // [2,4,8] splice(1,1) -> retorna 4 y el array queda: [2,8] ---- (1,1) empieza, cuantos items
        // [2,4,8] splice(1,2) -> retorna 4,8 y el array queda: [2] ---- (1,2) empieza, cuantos items
        // [2,4,8] slice(1,1) -> retorna null y el array queda: [2,4,8] ---- (1,1) empieza, termina (pero no lo incluye)
        // [2,4,8] slice(1,2) -> retorna 4 y el array queda: [2,4,8] ---- (1,2) empieza, termina (pero no lo incluye)
        this.items.splice(index, 1);
    }

    updateCount(id, newCount){
        //exactamente igual que findIndex pero devuelve todo el elemento
        //adicionalmente a ese elemento le asignamos el valor 
        this.items.find(el => el.id === id).count = newCount;
    }
}