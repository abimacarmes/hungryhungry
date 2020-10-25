"use strict";

const STORE = {
    currRecipe : {},
    savedRecipes : []
}

//The "Submit" functions are the event listeners for the various possible user interactions in the app.
//buttonSubmit: event listener, "Generate" button, calls recipe generating API. 
function buttonSubmit(){
    //Event listener for the "Generate!" button
    $('.searchButton').submit(event=> {
        event.preventDefault();
        
        //Send input to the getResults function
        getResults();
    });    
}

//saveSubmit: event listener, "Save" button, calls render save to save random recipe to the STORE variable and display in saved pannel.
function saveSubmit(){
    $('.js-recipe').on('submit','.saveButton',event =>{
        event.preventDefault();

        //Removes recipe from display
        $('.js-recipe').html("");
        
        //Add recipe to STORE variable
        STORE.savedRecipes.push(STORE.currRecipe);
        console.log(STORE.savedRecipes)

        //Calls render function to refresh saved recipes pannel.
        renderSave();
    })
}

//deleteSubmit: event listener, "Remove" button, calls save render function and removes the given recipe from the STORE variable and saved pannel.
function deleteSubmit(){
    $('.js-saved').on('submit','.deleteButton',event=>{
        event.preventDefault();

        //Gets the ID of the recipe the user wants to delete.
        let deleteID = $(event.currentTarget).parent().attr('class');
        
        //Removes the selected recipe from the STORE variable
        STORE.savedRecipes.splice(deleteID,1);
        
        //Calls render function to refresh saved recipes pannel.
        renderSave();

    })
}

//grocerySubmit: event listener, "Grocery List" button, calls the grocery render function and alters view of DOM with generated grocery list.
function grocerySubmit(){
    $('.groceryListButton').submit(event =>{
        event.preventDefault();

        //Loops through the saved recipes and their respective ingredients to create a combined grocery list.
        const groceryObject = {};

        for(let i=0;i<STORE.savedRecipes.length;i++){      
            STORE.savedRecipes[i].extendedIngredients.forEach(function(ingrs){
                if(ingrs.original in groceryObject){
                    groceryObject[ingrs.name][0] += ingrs.measures.metric.amount
                }
                else{
                    groceryObject[ingrs.name] = [ingrs.measures.metric.amount,ingrs.measures.metric.unitShort];
                }
            })     
        }
        console.log(groceryObject)

        //Calls the render function to change display to Grocery List mode.
        renderGroceryList(groceryObject);

        //Removes any displayed recipe and saved recipes.
        $('.js-saved').html("");
        $('.js-recipe').html("");
    })
}

//endGroceryListSubmit: event listener, "Remove Grocery" button to go back to recipe generator view with saved recipe pannel. 
function endGroceryListSubmit(){
    $('.groceryList').on('submit','.removeGrocery',event=>{
        event.preventDefault();

        $('.groceryList').html("");
        renderSave();
        $('.content').toggleClass('hidden');
    })
}

//Render functions are for altering the DOM

//Creates HTML and displays Grocery List in the DOM
function renderGroceryList(groceryObject){
    let groceryListHTML = "<h4>Grocery List:</h4>";

    let groceryArray = Object.entries(groceryObject);
    console.log(groceryArray)

    let currIngredientStr = "";
    let currCalories = 0;

    for(let i=0;i<groceryArray.length;i++){
        currIngredientStr = `${groceryArray[i][0]} - ${groceryArray[i][1][0]} ${groceryArray[i][1][1]}`

        groceryListHTML += `<ul>
            <li>${currIngredientStr}</li>
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

//Looks at the STORE variable and displays saved recipes in the save pannel.
function renderSave(){
    let savedHTML = "";

    for(let i=0;i<STORE.savedRecipes.length;i++){
        savedHTML += `
        <div class="item">
            <div class="${i}">
                <h4>${STORE.savedRecipes[i].title}</h4>
                <form class="deleteButton">
                    <button type="submit">Remove!</button>
                </form>
                <img src="${STORE.savedRecipes[i].image}" width="100">
            </div>
        </div>
        `
    }

    $('.js-saved').html(savedHTML);
}

//Get functions access APIs
//Accesses the Spoonacular API to generate a random recipe to be displayed.
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
        generateRecipeHTML(responseJson.recipes[0]);
    })
    .catch(error=> alert(error.message));
}
//Accesses the Edamam API to get the nutritional information of the generated recipe.
function getNutrition(recipeTitle,recipeIngredients,recipeHTML){
    let totalCalories =0;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"title": recipeTitle,"ingr": recipeIngredients});

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
    };

    fetch("https://api.edamam.com/api/nutrition-details?app_id=a97ec4a6&app_key=b504a6ebf4ca24cb69019c2f626e3734", requestOptions)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        console.log(responseJson)
        recipeHTML+=`<h4>Total Calories: ${responseJson.calories} - Servings: ${responseJson.yield}</h4>`
        $(".js-recipe").html(recipeHTML);
    })
    .catch(error => console.log(error.message));
}

//Generating/creating functions for formatting and getting information in the correct format.
//Takes the array of ingredients in the Spoonacular format and extracts the pertinent information
function createIngredientArray(ingredientArray){
    let recipeIngredients = [];

    for(let i=0;i<ingredientArray.length;i++){
        recipeIngredients.push(ingredientArray[i].name+" "+ingredientArray[i].measures.metric.amount+" "+ingredientArray[i].measures.metric.unitShort);
    }
    return recipeIngredients;
}

//Takes the Spoonacular recipe object and creates the HTML for displaying the recipe.
function generateRecipeHTML(recipeObject){
    console.log(recipeObject)
    //Grab the recipe object and get the correct input variables
    const recipeName = recipeObject.title;
    const recipeSrc = recipeObject.image;

    const ingredientList = ingredientHTML(recipeObject.extendedIngredients);
    const instructionList = instructionHTML(recipeObject.analyzedInstructions[0].steps);

    const nutritionArrayInput = createIngredientArray(recipeObject.extendedIngredients);
    const recipeHTML = `
            <h3>${recipeName}</h3>
            <img src="${recipeSrc}">
            <form class="saveButton">
                <button type="submit">Save!</button>
            </form> 
            <h4>Ingredients:</h4>
            <ul>
                ${ingredientList}    
            </ul>
            <h4>Steps:</h4>
            <ol>
                ${instructionList}
            </ol>
    `
    getNutrition(recipeObject.title,nutritionArrayInput,recipeHTML);
}

//Takes the Spoonacular ingredient array and creates the list elements for each ingredient.
function ingredientHTML(ingredientArray){
    let ingredientList = "";
    for(let i =0; i < ingredientArray.length;i++){
        let currIngredient = ingredientArray[i];
        ingredientList += `<li>${currIngredient.name} - 
            ${currIngredient.measures.metric.amount} ${currIngredient.measures.metric.unitShort}</li>`
    }
    return ingredientList;
}

//Takes the Spoonacular instruction array and creates the list elements for each instruction.
function instructionHTML(instructionArray){
    let instructionList = "";
    for(let i =0; i < instructionArray.length;i++){
        let currInstruction = instructionArray[i];
        instructionList += `<li>${currInstruction.step}</li>`
    }
    return instructionList;
}

//Waits for the page to load before calling any event listeners.
$(pageLoaded);

//Calls necessary functions and event listeners.
function pageLoaded(){
    buttonSubmit();
    saveSubmit();
    deleteSubmit();
    grocerySubmit();
    endGroceryListSubmit();
}

