const express = require("express");
const router = express.Router();

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

router.post("/:id/send-text", async function (req, res, next) {
  try {
    await client.messages.create({
      body: "Hey Dan",
      from: "+12029533907",
      to: "+15415137352",
    });

    res.send("Message sent");
  } catch (error) {
    console.log(error);
    throw error;
  }
});

module.exports = router;
