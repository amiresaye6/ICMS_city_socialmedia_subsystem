const express = require("express");

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({message: "hi thiere, this is the first route in our project"})
})

const port = process.env.PORT || 5555;

app.listen(port, () => {
    console.log(`"Server is running on http://localhost:${port}`);
    
})
