const axios = require("axios");

exports.getAIPlan = async (data) => {
    const response = await axios.post(
        "http://localhost:8000/ai/plan",
        data
    );

    return response.data;
};
