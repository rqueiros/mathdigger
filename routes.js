const router = require("express").Router();
const path = require("path");

// Requiring Ltijs
const lti = require("ltijs").Provider;

router.post("/getGrade", async (req, res) => {
  const idtoken = res.locals.token;
  const response = await lti.Grade.getScores(
    idtoken,
    idtoken.platformContext.endpoint.lineitem,
    { userId: req.body.userId }
  );
  return res.send(response);
});

// Grading route
router.post("/grades", async (req, res) => {
  console.log("ENTREI");
  try {
    const idtoken = res.locals.token; // IdToken
    const score = req.body.grade; // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      //userId: req.body.userId,
      userId: idtoken.user,
      scoreGiven: 3,
      scoreMaximum: 99,
      activityProgress: "Submitted",
      gradingProgress: "FullyGraded",
    };

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem; // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, {
        resourceLinkId: true,
      });
      const lineItems = response.lineItems;
      if (lineItems.length === 0) {
        // Creating line item if there is none
        const newLineItem = {
          scoreMaximum: 100,
          label: "Grade",
          tag: "grade",
          resourceLinkId: idtoken.platformContext.resource.id,
        };
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem);
        lineItemId = lineItem.id;
      } else lineItemId = lineItems[0].id;
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(
      idtoken,
      lineItemId,
      gradeObj
    );
    const x = {
      idtoken: idtoken,
      lineItemId: lineItemId,
      gradeObj: gradeObj,
    };
    return res.send(x);
  } catch (err) {
    //return res.status(500).send({ err: err.message });
    return res.send("xxx");
  }
});

// Names and Roles route
router.post("/members", async (req, res) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token);
    if (result) return res.send(result.members);
    return res.sendStatus(500);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

// Handles deep linking request generation with the selected resource
router.post("/deeplink", async (req, res) => {
  console.log("POST DEEP LINKING");
  try {
    const resource = req.body;

    const items = [
      {
        type: "ltiResourceLink",
        title: resource.title,
        url: "https://fgpe.dcc.fc.up.pt/lti-tool/" + resource.title,
      },
    ];

    const form = await lti.DeepLinking.createDeepLinkingForm(
      res.locals.token,
      items,
      { message: "Successfully Registered" }
    );
    if (form) return res.send(form);
    return res.sendStatus(500);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

router.get("/members", async (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/members.html"));
});

router.get("/home", async (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/example", async (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/example.html"));
});

router.get("/deeplinking", async (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/resources.html"));
});

// Return available deep linking resources
router.get("/resources", async (req, res) => {
  const resources = [
    {
      name: "Resource1",
      value: "value1",
    },
    {
      name: "Resource2",
      value: "value2",
    },
    {
      name: "Resource3",
      value: "value3",
    },
  ];
  return res.send(resources);
});

// Get user and context information
router.get("/info", async (req, res) => {
  const token = res.locals.token;
  const context = res.locals.context;

  const info = {};
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name;
    if (token.userInfo.email) info.email = token.userInfo.email;
  }
  if (token.user) info.id = token.user;

  console.log("info" + info);

  if (context.roles) info.roles = context.roles;
  if (context.context) info.context = context.context;

  return res.send(info);
});

// Wildcard route to deal with redirecting to React routes
router.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

module.exports = router;
