"use strict";

const STORE = {
    currRecipe : {},
    savedRecipes : []
}

function buttonSubmit(){
    //Event listener for the "Generate!" button
    $('.searchButton').submit(event=> {
        event.preventDefault();
        
        //Send input to the getResults function
        getResults();
    });    
}

function getResults(){
    const apiKey = "9e35ae1ce4c14d529b4239ac15c27cd0";
    let searchURL = `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&tags=dinner&number=1`;

    fetch(searchURL)
    .then(response =>{
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        console.log(responseJson);
        STORE.currRecipe = responseJson.recipes[0];
        renderRecipe(responseJson.recipes[0]);
    })
    .catch(error=> alert(error.message));
}

function renderRecipe(recipeObject){
    //Grab the recipe object and get the correct input variables
    const recipeName = recipeObject.title;
    const recipeSrc = recipeObject.image;

    const ingredientList = ingredientHTML(recipeObject.extendedIngredients);
    
    const recipeHTML = `
        <h3>${recipeName}</h3>
        <img src="${recipeSrc}" width="300">
        <form class="saveButton">
            <button type="submit">Save!</button>
        </form>
        <h4>Ingredients:</h4>
        <ul>
            ${ingredientList}    
        <li>Ingredient</li>
        </ul>
        <h4>Steps:</h4>
        <ol>
            ${recipeObject.instructions}
        </ol>
    `
    $(".js-recipe").html(recipeHTML);
}

function saveSubmit(){
    $('.js-recipe').on('submit','.saveButton',event =>{
        event.preventDefault();

        $('.js-recipe').html("");
        STORE.savedRecipes.push(STORE.currRecipe);
        console.log(STORE.savedRecipes)
        $('.searchButton').trigger('reset');
        renderSave();
    })
}

function deleteSubmit(){
    $('.js-saved').on('submit','.deleteButton',event=>{
        event.preventDefault();

        let deleteID = $(event.currentTarget).parent().attr('class');
        
        STORE.savedRecipes.splice(deleteID,1);
        
        renderSave();

    })
}

function renderSave(){
    let savedHTML = "";

    for(let i=0;i<STORE.savedRecipes.length;i++){
        savedHTML += `
        <div class="${i}">
            <h4>${STORE.savedRecipes[i].title}</h4>
            <img src="${STORE.savedRecipes[i].image}" width="100">
            <form class="deleteButton">
                <button type="submit">Remove!</button>
            </form>
        </div>
        `
    }

    $('.js-saved').html(savedHTML);
}
function ingredientHTML(ingredientArray){
    let ingredientList = "";
    for(let i =0; i < ingredientArray.length;i++){
        let currIngredient = ingredientArray[i];
        ingredientList += `<li>${currIngredient.name} - 
            ${currIngredient.measures.metric.amount} ${currIngredient.measures.metric.unitShort}</li>`
    }
    return ingredientList;
}

$(pageLoaded);

function pageLoaded(){
    buttonSubmit();
    saveSubmit();
    deleteSubmit();

}

