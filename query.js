const API_TOKEN = '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'

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
        const nonNouns = ["a","the"]

        let responseWithoutQuestion = response[0].generated_text.replace(`Question 1: Please answer the following Jeopardy question,\nHost: ${question}.\nAnswer: \"what is ____\"\n`, "")
        singleAnswer = responseWithoutQuestion.split("\n")[0].replace("a.", "")

        nonNouns.forEach((word) => {
            if (singleAnswer.includes(word)){
                singleAnswer = singleAnswer.replace(word, "").replace(/[^0-9a-z]/gi, '').slice(1)
            }
        })
        console.log(singleAnswer)

        if (question[0].answer === singleAnswer){
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
    let question;
    request.onload = function () {
        if (request.status < 200 && request.status >= 400) {
            console.log(`Error ${request.status}: ${request.statusText}`);
            return;
        }

        question = JSON.parse(this.response);
        console.log(question[0].question)

        getAiResponse(`The answer is: ${question[0].question}`);


    }

}

getQuestion()