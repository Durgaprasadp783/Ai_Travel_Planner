try {
    const mongoose = require("mongoose");
    console.log("Mongoose loaded successfully");
} catch (err) {
    console.error("Mongoose load error:");
    console.error(err.code);
    console.error(err.message);
    console.error(err.stack);
}
