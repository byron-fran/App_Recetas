
//Funcion para iniciar la APP
function iniciarApp(){
    const select = document.querySelector('#categorias');
    const resultado = document.querySelector('#resultado');
    const mis_favoritos = document.querySelector('.favoritos')
    const modal = new bootstrap.Modal('#modal', {})
    //reivisa si el selector existe para agregar el eventListener
    if(select){
        select.addEventListener('change', mostrarSelect);
        obtenerCategorias()
    }
    if(mis_favoritos){
        mostrarFavoritos()
    }

  
    //Realiza Peticion de la API con Promises
    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(res=>res.json())
            .then(resp => mostrarInfo(resp.categories))
        
    }

    function mostrarInfo(categories= []){
        //Obtiene los datos e itera creando html
        categories.forEach(categoria=>{
            const option = document.createElement('OPTION');
            const {strCategory} =categoria;
            option.value = strCategory;
            option.textContent = strCategory;
            select.appendChild(option);
            
            
        })
        

    };

    function mostrarSelect(e){
        //Busca una categoria 
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
            .then(res=>res.json())
            .then(res => mostrarReceta(res.meals))
        
        
    }

    function mostrarReceta(recetas= []){

        limpiarRecta(resultado)
       
        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5')
        heading.textContent = recetas.length>=!1? 'Resultados':'No hay resultados';
        resultado.appendChild(heading)
       recetas.forEach(receta=>{

            const {idMeal,strMeal,strMealThumb} = receta
           const recetaContainer = document.createElement('DIV');
           recetaContainer.classList.add('col-md-4');
           const recetaCard = document.createElement('DIV');
           recetaCard.classList.add('card', 'mb-4')
           const recetaIMG = document.createElement('IMG');
           recetaIMG.classList.add('img-top-4');
           recetaIMG.alt = `img-${strMeal}`?? receta.titulo
           recetaIMG.src = `${strMealThumb ?? receta.imagen}` 
            
            
           const recetaBody = document.createElement('DIV');
           recetaBody.classList.add('card-body');

           const cardHeading = document.createElement('h3');
           cardHeading.classList.add('card-title', 'mb-3') ;
            cardHeading.textContent = strMeal ?? receta.titulo

           const cardButton = document.createElement('BUTTON');
           cardButton.textContent = 'Ver Receta'
           cardButton.classList.add('btn', 'btn-danger', 'w-100');


           cardButton.onclick = function(){
                selecionarReceta(idMeal ?? receta.id)

           }


           recetaBody.appendChild(cardHeading)
           recetaBody.appendChild(cardButton);

           recetaCard.appendChild(recetaIMG);
          recetaCard.appendChild(recetaBody);

          recetaContainer.appendChild(recetaCard);

          resultado.appendChild(recetaContainer);


       })
    };

    //selecion de reaceta en base al id
    function selecionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(res => res.json())
            .then(resp => mostrarRecetaModal(resp.meals[0]))
        
        
    }
    function mostrarRecetaModal(receta){

        
        const {idMeal,strInstructions, strMeal,strMealThumb
        } = receta;
   
        
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody  = document.querySelector('.modal .modal-body');
        //Agrega HTML
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt='${strMeal}'/>
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3>ingredientes e insctrucciones</h3>
        `
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group')
        for(let i=1; i<20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrendiente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLI = document.createElement('LI');
                ingredienteLI.classList.add('list-group-item');
                ingredienteLI.textContent= `${ingrendiente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLI);

                modalBody.appendChild(listGroup)

                //botones de cerrar y guardar
                const footerModal = document.querySelector('.modal-footer')
                limpiarRecta(footerModal)

                const btnFavorito = document.createElement('BUTTON');
                btnFavorito.classList.add('btn', 'btn-danger', 'col')
                btnFavorito.textContent =existeStorage(idMeal)? 'Elminar Favorito':'Guardar Favorito'


                // localStorage

                btnFavorito.onclick = function(){
                    if(existeStorage(idMeal)){
                        borrarFavorito(idMeal)
                        btnFavorito.textContent = 'Guardar Favorito';
                         mostrarToast('Eliminado Correctamente')
                        return
                    }
                    guardarFavorito({
                        id: idMeal,
                        title: strMeal,
                        imagen : strMealThumb
                    })
                    btnFavorito.textContent = 'Eliminar favorito'
                    mostrarToast('Agregado correctamente')
                   
                }

                const btnCerrar = document.createElement('BUTTON');
                btnCerrar.textContent = 'Cerrar'
                btnCerrar.classList.add('btn', 'btn-secundary', 'col');

                btnCerrar.onclick = function(){
                    modal.hide()
                }
                footerModal.appendChild(btnFavorito);
                footerModal.appendChild(btnCerrar)
            }
        }
        modal.show();

        
    }

    //Obtener los datos de localStorage
    function guardarFavorito(receta){
        const favoritos = JSON.parse (localStorage.getItem('favoritos')) ?? [];

        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
        
    };

    function borrarFavorito(id){
        const favoritos = JSON.parse (localStorage.getItem('favoritos')) ?? [];

        const nuevosFavoritos = favoritos.filter(favorito => favorito.id != id)
        return nuevosFavoritos
    }

    function existeStorage (id){
        const favoritos = JSON.parse (localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id ===id)
    }

    function mostrarToast(mensaje){
        const toastID = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastID);
        toastBody.textContent = mensaje;
        toast.show()
    }


    function mostrarFavoritos(){
        const favoritos = JSON.parse (localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarReceta(favoritos)
            return
        }
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        mis_favoritos.appendChild(noFavoritos)

    }
    function limpiarRecta(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild)
        }
    }



};

document.addEventListener('DOMContentLoaded', iniciarApp)

