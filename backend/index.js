const express=require("express")
const cors=require("cors")
const app=express()
const {connection}=require("./db")
const {apiRouter}=require("./routes/api.route")
const {questionRouter}=require("./routes/question.route")

const dotenv=require("dotenv")
const {Configuration, OpenAIApi}=require("openai")

dotenv.config()
app.use(express.json())
app.use(cors())
app.use("/question",questionRouter)
app.use("/api",apiRouter)



app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log("Connected to db")
        console.log("Server is running on port 8000")
    } catch (error) {
        console.log(error)
    } 
})
