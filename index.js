"use strict";

function buttonSubmit(){
    //Event listener for the "Generate!" button
    $('.searchButton').submit(event=> {
        event.preventDefault();
        
        //Send input to the getResults function
        getResults();
    });    
}

function getResults(inputIngredient){
    //Response from API is structured differently depending on random or ingredient search - indicator to handle this
    let ingredientProvided = false;

    const apiKey = "9e35ae1ce4c14d529b4239ac15c27cd0";
    let searchURL = "https://api.spoonacular.com/recipes/random?apiKey=9e35ae1ce4c14d529b4239ac15c27cd0&tags=dinner&number=1";
    
    let responseObject = {};

    fetch(searchURL)
    .then(response =>{
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        console.log(responseJson);
        pushRecipe(responseJson.recipes[0]);
    })
    .catch(error=> alert(error.message));
}

function pushRecipe(recipeObject){
    //Grab the recipe object and get the correct input variables
    const recipeName = recipeObject.title;
    const recipeSrc = recipeObject.image;

    const ingredientList = ingredientHTML(recipeObject.extendedIngredients);
    
    const recipeHTML = `
        <h3>${recipeName}</h3>
        <img src="${recipeSrc}" width="300">
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
}

