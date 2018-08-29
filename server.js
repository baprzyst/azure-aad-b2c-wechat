var express = require('express');
var app = express();
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var config = require('./public/config.js')


var tenantID = config.tenantID;
var clientID = config.clientID;
var policyName = config.policyName;

var options = {
    identityMetadata: "https://login.microsoftonline.com/" + tenantID + "/v2.0/.well-known/openid-configuration/",
    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: true,
    loggingLevel: 'info',
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options,
    function (token, done) {
        // Send user info using the second argument
        console.log(token);
        done(null, {}, token);
    }
);



app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/server",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        if (claims['scp'].split(" ").indexOf("read") >= 0) {
            // Service relies on the name claim.  
            res.status(200).json({
                'claims': claims,
                'ts': (new Date())
            });
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);







app.use('/client', express.static('public'));

app.listen(5000);