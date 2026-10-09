const express = require("express");
const path = require("path");
const router = express.Router();
const passResponse = require("../data/clear/pass.json");

router.get("/verify", async (req, res) => {
  console.log("Clear 1 Session Landing Page:", req.body);
  return res.sendFile(
    path.join(__dirname, "../views", "clear_landing_page.html"),
  );
});

router.post("/v1/verification_sessions", async (req, res) => {
  console.log("Clear 1 Create Session Request:", req.body);
  const response = {
    id: "123546",
    token: "abc-123",
  };
  console.log("Clear 1 Session Created:", response);
  return res.status(200).json(response);
});

router.get("/v1/verification_sessions/:id", async (req, res) => {
  console.log("Clear 1 Get Session Results:", req.params, req.body);
  console.log("Clear 1 Session Results Found!", req.params);
  return res.status(200).json(passResponse);
});

module.exports = router;
