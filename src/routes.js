const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const { matchedData } = require("express-validator/filter");
const gh = require("./org/gitAdd");
require('dotenv').config();

const ORG = process.env.GH_ORG;

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/codeforkenyans", (req, res) => {
  res.render("contact", {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  });
});

router.post("/codeforkenyans",[
    check("message")
      .isLength({ min: 1 })
      .withMessage("Message is required")
  ],
  (req, res) => {
    const errors = validationResult(req);
    const data = matchedData(req);
    const username = data.message;
    var myfunc = gh.checkUsername(username);

    if (!errors.isEmpty()) {
      return res.render("contact", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    } else {
      
      myfunc.then(function() {
          gh.addToOrg(username).then(() => {
              req.flash('success', `you have been successfully added to ${ORG} happy coding`)
              res.redirect('/')
          });
        })
        .catch((err) => {
          const errors = validationResult(myfunc);

          // Recommended: send the information to sentry.io
          // or any crash reporting service you prefer
          return res.render("contact", {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
          });
        });
    }
  }
);

module.exports = router;
