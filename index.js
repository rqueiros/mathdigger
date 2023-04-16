require("dotenv").config();
const express = require("express");
const path = require("path");
const routes = require("./src/routes");

const lti = require("ltijs").Provider;

// Setup
lti.setup(
  "LTIKEY",
  {
    url: "mongodb+srv://ricardoqueiros:DyaETxwohPts8VRi@clustermathdigger.p8ushuu.mongodb.net/?retryWrites=true&w=majority",
    connection: {
      user: "ricardoqueiros",
      pass: "DyaETxwohPts8VRi",
    },
  },
  {
    staticPath: path.join(__dirname, "./public"), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None", // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
);

// When receiving successful LTI launch redirects to appss
lti.onConnect(async (token, req, res) => {
  console.log("YESS");
  return res.send("It's alive!");
  //console.log("the token is working:", token);
  //return res.sendFile(path.join(__dirname, "./public/index.html"));
});

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, "/deeplink", { newResource: true });
});

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  console.log(process.env);
  await lti.deploy({ serverless: true });

  const app = express();
  app.use("/", lti.app);
  app.listen(3000);

  /*
   const app = express();
  app.use("/", lti.app);
  app.listen(3000);
  */
  /**
   * Register platform
   */

  /*const platform = await lti.registerPlatform({
    url: process.env.MOODLE_URL,
    name: process.env.LTI_TOOL_NAME,
    clientId: process.env.LTI_TOOL_CLIENT_ID,
    authenticationEndpoint: `${process.env.MOODLE_URL}/mod/lti/auth.php`,
    accesstokenEndpoint: `${process.env.MOODLE_URL}/mod/lti/token.php`,
    authConfig: {
      method: 'JWK_SET',
      key: `${process.env.MOODLE_URL}/mod/lti/certs.php`
    }
  })

  const authConfig = await platform.platformAuthConfig();
  console.log(authConfig);
  console.log(await platform.platformPublicKey())

  */

  // Register platform

  await lti.registerPlatform({
    url: "https://moodle.cip.ipp.pt/",
    name: "Moodle",
    clientId: "mSAcO7bAiXPAHfM",
    authenticationEndpoint: "https://moodle.cip.ipp.pt/mod/lti/auth",
    accesstokenEndpoint: "https://moodle.cip.ipp.pt/mod/lti/token",
    authConfig: {
      method: "JWK_SET",
      key: "https://moodle.cip.ipp.pt/mod/lti/keyset",
    },
  });
  const authConfig = await platform.platformAuthConfig();
  console.log(authConfig);
  console.log(await platform.platformPublicKey());
};

setup();
