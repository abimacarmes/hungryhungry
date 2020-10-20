"use strict";

const STORE = {
    currRecipe : {},
    savedRecipes : []
}

function grocerySubmit(){
    $('.groceryListButton').submit(event =>{
        event.preventDefault();

        const groceryObject = {};

        for(let i=0;i<STORE.savedRecipes.length;i++){      
            STORE.savedRecipes[i].extendedIngredients.forEach(function(ingrs){
                if(ingrs.original in groceryObject){
                    groceryObject[ingrs.name][0] += ingrs.amount
                }
                else{
                    groceryObject[ingrs.name] = [ingrs.amount,ingrs.measures.metric.unitShort];
                }
            })     
        }
        console.log(groceryObject)
        renderGroceryList(groceryObject);

        $('.js-saved').html("");
        $('.js-recipe').html("");
    })
}

function renderGroceryList(groceryObject){
    let groceryListHTML = "<h3>Grocery List</h3>";

    let groceryArray = Object.entries(groceryObject);
    console.log(groceryArray)

    for(let i=0;i<groceryArray.length;i++){
        groceryListHTML += `<ul>
            <li>${groceryArray[i][0]} - ${groceryArray[i][1][0]} ${groceryArray[i][1][1]}</li>
        </ul>`
    }
    
    groceryListHTML += `
    <form class="removeGrocery">
        <button type="submit">Back to Generator</button>
    </form>
    `
    $('.content').toggleClass('hidden');
    $('.groceryList').html(groceryListHTML);
}

function endGroceryListButton(){
    $('.groceryList').on('submit','removeGrocery',event=>{
        event.preventDefault();

        $('.groceryList').html("");
        renderSave();
        $('.content').toggleClass('hidden');
    })
}

function getNutrition(ingredient){
    let nutritionURL =`https://api.edamam.com/api/nutrition-data?app_id=a97ec4a6&app_key=b504a6ebf4ca24cb69019c2f626e3734&ingr=${ingredient}`
    
    fetch(nutritionURL)
    .then(response =>{
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })  
    .then(responseJson => {
        console.log(responseJson);
        return responseJson;
    })
    .catch(error=> alert(error.message));
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
    grocerySubmit();
    endGroceryListButton();
}

