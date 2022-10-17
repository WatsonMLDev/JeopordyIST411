const API_TOKEN = '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'
const valueArray = [100,200,300,400,500]
let categoryArray
let questionArray =[[],[],[],[],[]]
let currentQuestion
let aiScore = 0
let humanScore = 0

function onDropdownChange(){
    let dropdown = document.querySelector("#themeSelect").selectedIndex
    if (dropdown === 0){
        document.querySelector("#styleSheet").href = "darkMode.css"
    }
    else{
        document.querySelector("#styleSheet").href = "lightMode.css"
    }
}

function getAiResponse(question){
    let request = new XMLHttpRequest();
    request.open("POST",  "https://api-inference.huggingface.co/models/bigscience/bloom", false);
    request.setRequestHeader("Authorization", `Bearer ${API_TOKEN}`);
    request.send(JSON.stringify({"inputs": `Question 1: Please answer the following Jeopardy question,\nHost: ${question}.\nAnswer: \"what is ____\"\na.`}));

    if (request.status < 200 && request.status >= 400) {
        console.log(`Error ${request.status}: ${request.statusText}`);
        return;
    }

    let response = JSON.parse(request.response);
    const nonNouns = ["a ","the "]

    let responseWithoutQuestion = response[0].generated_text.replace(`Question 1: Please answer the following Jeopardy question,\nHost: ${question}.\nAnswer: \"what is ____\"\n`, "")
    let singleAnswer = responseWithoutQuestion.split("\n")[0].replace("a.", "")

    nonNouns.forEach((word) => {
        if (singleAnswer.includes(word)){
            singleAnswer = singleAnswer.replace(word.replace(" ",""), "")
        }
    })
    return singleAnswer.trim()

}

function showQuestion(row, column, button){
    currentQuestion = questionArray[row][column]
    button.disabled = true

    if (currentQuestion === "No question"){
        return
    }

    let questionHeader = document.querySelector("#questionHeader").classList
    questionHeader.remove("questionInvisibleText")
    questionHeader.add("questionVisibleText")

    let questionLabel = document.querySelector("#questionLabel")
    questionLabel.classList.remove("questionInvisibleText")
    questionLabel.classList.add("questionVisibleText")
    questionLabel.innerHTML = questionArray[row][column].question
    questionArray[row][column] = null

    let responseDescription = document.querySelector("#responseDescription").classList
    responseDescription.remove("answerInvisibleText")
    responseDescription.add("answerVisibleText")
    let responseBox = document.querySelector("#responseBox").classList
    responseBox.remove("answerBoxInvisible")
    responseBox.add("answerBoxVisible")
    let submitAnswer = document.querySelector("#submitAnswer").classList
    submitAnswer.remove("answerBoxInvisible")
    submitAnswer.add("answerBoxVisible")

    let answerResultDescription = document.querySelector("#answerResultDescription").classList
    answerResultDescription.remove("answerVisibleText")
    answerResultDescription.add("answerInvisibleText")
    let answerResult = document.querySelector("#answerResult")
    answerResult.classList.remove("answerVisibleText")
    answerResult.classList.add("answerInvisibleText")

    let aiResultDescription = document.querySelector("#aiResultDescription")
    aiResultDescription.classList.remove("answerVisibleText")
    aiResultDescription.classList.add("answerInvisibleText")
    let aiResult = document.querySelector("#aiResult")
    aiResult.classList.remove("answerVisibleText")
    aiResult.classList.add("answerInvisibleText")

    console.log(`Cheater, shame....: ${currentQuestion.answer}`)

}
function submitAnswer(){
    let answer = document.querySelector("#responseBox").value

    let answerResultDescription = document.querySelector("#answerResultDescription").classList
    answerResultDescription.remove("answerInvisibleText")
    answerResultDescription.add("answerVisibleText")

    let answerResult = document.querySelector("#answerResult")
    answerResult.classList.remove("answerInvisibleText")
    answerResult.classList.add("answerVisibleText")

    if(answer.toLowerCase() === currentQuestion.answer.toLowerCase()){
        answerResult.innerHTML = "Correct!"
        humanScore += currentQuestion.value
        document.querySelector("#humanScore").innerHTML = humanScore
    }
    else{
        answerResult.innerHTML = "Incorrect!"
    }

    aiTurn()
}

function aiTurn(){
    let aiQuestion
    while (true){
        let row = Math.floor(Math.random() * 5)
        let column = Math.floor(Math.random() * 5)
        if (questionArray[row][column] !== null){
            aiQuestion = questionArray[row][column]
            questionArray[row][column] = null
            document.querySelector("#jeopardyBoard").rows[row+1].cells[column].getElementsByTagName("button")[0].disabled = true
            break;
        }
    }

    if (aiQuestion === "No question"){
        return
    }

    let aiAnswer = getAiResponse(aiQuestion.question)

    console.log('-------------------------------------')
    console.log(`AI Answer: ${aiAnswer}`)
    console.log(`Correct Answer: ${aiQuestion.answer}`)
    console.log('-------------------------------------')

    let aiResultDescription = document.querySelector("#aiResultDescription")
    aiResultDescription.classList.remove("answerInvisibleText")
    aiResultDescription.classList.add("answerVisibleText")

    let aiResult = document.querySelector("#aiResult")
    aiResult.classList.remove("answerInvisibleText")
    aiResult.classList.add("answerVisibleText")

    aiResultDescription.innerHTML = `AI's question:  ${aiQuestion.question}`
    if(aiAnswer.toLowerCase() === aiQuestion.answer.toLowerCase()){
        aiResult.innerHTML = `AI answer: ${aiAnswer}.....Correct!`
        aiScore += aiQuestion.value
        document.querySelector("#aiScore").innerHTML = aiScore
    }
    else{
        aiResult.innerHTML = `AI answer: ${aiAnswer}.....Incorrect!`
    }



}
function setUpCategories(){
    let randomNum = Math.floor(Math.random() * 6703) // replace with 1 to keep it simple for testing
    let amount = 10 //10 is hardcoded into index.html, change it there if you want to change it here as well

    let request = new XMLHttpRequest();
    request.open("GET", `https://jservice.io/api/categories?count=${amount}&offset=${randomNum}`, true);
    request.send()
    request.onload = function () {

        // if a bad response, just return before running anymore code
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return;
        }
        categoryArray = JSON.parse(this.response)

        // block of code to put the categories on the category selector
        categoryArray.forEach((category,index) => {
            cat = document.querySelector("#cat"+(index+1))
            cat.innerHTML = category.title

        })
    }
}

function createQuestions(){
    categoryArray.forEach((category,index) => {
        let request = new XMLHttpRequest();
        request.open("GET", `https://jservice.io/api/category?id=${category.id}`, false); // most annoying issue ever, had to make it false to get it to work. forces response to be synchronous
        request.send()
        let data = JSON.parse(request.response);

        // if a bad response, just return before running anymore code
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return "Error";
        }

        // block of code to separate all questions by value
        let seperatedQuestionArray = [[],[],[],[],[]]
        data.clues.forEach((clue) => {
            if(valueArray.includes(clue.value)){
                seperatedQuestionArray[valueArray.indexOf(clue.value)].push(clue)
            }
        })

        // block of code to randomly select 1 question for each value, if there are no questions for that value, it will make it "No Question"
        let randomQuestionsForCategory = []
        let counter = 0
        while (randomQuestionsForCategory.length < 5) {
            if (seperatedQuestionArray[counter].length === 0){
                randomQuestionsForCategory.push("No Question")
            } else {
                let randomNum = Math.floor(Math.random() * seperatedQuestionArray[counter].length)
                if (!randomQuestionsForCategory.includes(randomNum)) {
                    randomQuestionsForCategory.push(seperatedQuestionArray[counter][randomNum])
                    counter++
                }
            }
        }

        // block of code to set each random question to the main game board in the correct position
        questionArray.forEach((categoryArrayOfQuestions, index) => {
            categoryArrayOfQuestions.push(randomQuestionsForCategory[index])
        })

    })
}

function createGame(){
    // add the 5 categories selected to the game
    let tempArray = []
    categoryArray.forEach((category, index) => {
        if(document.querySelector("#checkboxCat" + (index+1)).checked){
            tempArray.push(category)
        }
    })

    //force the user to select 5 categories
    if (tempArray.length < 5){
        alert("Please select at least 5 categories")
        return;
    }
    categoryArray = tempArray

    // transitions to the main game board by hiding category selector

    let submitButton = document.querySelector("#submitCat").classList
    submitButton.remove("visibleSaveButton")
    submitButton.add("invisibleSaveButton")
    let catSelectorTable = document.querySelector("#catSelector").classList
    catSelectorTable.remove("visibleCatSelector")
    catSelectorTable.add("invisibleCatSelector")
    let jBoard = document.querySelector("#jeopardyBoard").classList
    jBoard.remove("invisibleJeopardy")
    jBoard.add("visibleJeopardy")

    document.querySelector("#score").style.visibility = "visible"

    //puts the categories on the game board header
    categoryArray.forEach((category,index) => {
        cat = document.querySelector("#finalCat"+(index+1))
        cat.innerHTML = category.title

    })
    createQuestions()

    console.log(questionArray)

}

setUpCategories()

