const API_TOKEN = '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'
let questionJson;
let AIAnswer;
let categoryArray;

function getAiResponse(question){
    let request = new XMLHttpRequest();
    request.open("POST",  "https://api-inference.huggingface.co/models/bigscience/bloom", true);
    request.setRequestHeader("Authorization", "Bearer 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");
    request.send(JSON.stringify({"inputs": `Question 1: Please answer the following Jeopardy question,\nHost: ${question}.\nAnswer: \"what is ____\"\na.`}));
    let singleAnswer
    request.onload = function() {
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return;
        }
        let response = JSON.parse(this.response);
        const nonNouns = ["a ","the "]

        let responseWithoutQuestion = response[0].generated_text.replace(`Question 1: Please answer the following Jeopardy question,\nHost: ${question}.\nAnswer: \"what is ____\"\n`, "")
        singleAnswer = responseWithoutQuestion.split("\n")[0].replace("a.", "")

        nonNouns.forEach((word) => {
            if (singleAnswer.includes(word)){
                singleAnswer = singleAnswer.replace(word.replace(" ",""), "")
            }
        })
        AIAnswer = singleAnswer.trim()
        console.log(`the AI answer is ${AIAnswer}`)
        console.log(`the real Answer is ${questionJson.answer}`)
        if (questionJson.answer.toLowerCase() === AIAnswer.toLowerCase()){
            console.log("Correct")
        } else {
            console.log("Incorrect")
        }
    }




}
function getQuestion() {
    let request = new XMLHttpRequest();
    request.open("GET", "https://jservice.io/api/random?count=1", true);
    request.send()
    //let test;
    request.onload = function () {
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return;
        }

        question = JSON.parse(this.response);
        console.log(question[0].question)

        questionJson = question[0]
        getAiResponse(questionJson.question)





    }
    //console.log(`the question is ${test}`)

}


function setUpCategories(){
    let randomNum = 1
    let request = new XMLHttpRequest();
    request.open("GET", `https://jservice.io/api/categories?count=5&offset=${randomNum}`, true);
    request.send()
    request.onload = function () {
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return;
        }
        categoryArray = JSON.parse(this.response);
        console.log(categoryArray)
        categoryArray.forEach((category,index) => {
            cat = document.querySelector("#cat"+(index+1))
            console.log(category)
            cat.innerHTML = category.title

        })
    }
}

