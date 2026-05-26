const mongoose = require("mongoose");
const app = require("./app.js");

const PORT = 8080;
const dbUrl = process.env.ATLASDB_URL;

// Setting up database
async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// Starting the server
app.listen(PORT, () => {
    console.log("App is running at port 8080");
});
