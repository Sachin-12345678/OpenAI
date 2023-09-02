const express=require("express")
const apiRouter=express.Router()
const {Configuration, OpenAIApi}=require("openai")
const readline=require("readline")
const {QuestionModel}=require("../model/questions.model")
const natural = require('natural');

const openai=new OpenAIApi(new Configuration({
    apiKey:process.env.API_Key
}))

apiRouter.get("/Questions",async(req,res)=>{
    try {

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Ask me one interview question on Nodejs, I need only question" }],
        });
        res.status(200).json({ Question: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong." });
    }
})

apiRouter.post("/chat/new",(req,res)=>{
    let question=req.body.question || 'How to use chatgpt?'
    openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${question}`,
        max_tokens: 4000,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }).then(response=>{
        return response?.data?.choices?.[0].text;
      }).then((ans)=>{
        const arr=ans?.split("\n").filter(ele=>ele).map(value=>value.trim());
        return arr;
      })
      .then(response=>{
        res.json({
            answer:response,
            prompt:question
        })        
    })
})



// Function to generate a response using the model
async function generateResponse(prompt, userAnswer) {
    const messages = [
        { role: "user", content: prompt },
        { role: "assistant", content: userAnswer }
    ];

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    return response.data.choices[0].message.content.trim();
}


function scoreAnswer(userAnswer, expectedAnswer) {
    const similarityThreshold = 3;

    const distance = calculateLevenshteinDistance(userAnswer, expectedAnswer);
    let score = 10 - Math.min(distance, similarityThreshold); 

    if (score < 1) {
        score = 1;
    }

    return score;
}

 const randomNum = Math.floor(Math.random() * 10) + 1;
apiRouter.get("/get/Question",async(req,res)=>{
    try {
        const interviewQuestion = await QuestionModel.findOne({id:randomNum});
        res.send(interviewQuestion.Question)
    } catch (error) {
       res.status(400).send(error) 
    }
})

apiRouter.post("/trial", async (req, res) => {
    const userAnswer = req.body.userAnswer; 

    try {
         const interviewQuestion = await QuestionModel.findOne({id:randomNum});
         console.log(interviewQuestion.Question)

        const response = await generateResponse(interviewQuestion.Question, userAnswer);
    
        const score = scoreAnswer(userAnswer, response);
        
        let feedback;
        if (score >= 7) {
            feedback = "Great job! Your answer is correct.";
        } else if (score >= 4) {
            feedback = "Your answer is partially correct.";
        } else {
            feedback = "Your answer is incorrect.";
        }

        res.status(200).json({
            Question: interviewQuestion.Question,
            UserAnswer: userAnswer,
            RequiredAns: response,
            Score: score,
            Feedback: feedback,
        });
    } catch (error) {
        res.status(500).json({ error: error});
    }

});


module.exports={apiRouter}