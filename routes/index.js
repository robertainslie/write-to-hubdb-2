var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('lodash');

var hapikey = process.env.HAPI_KEY
var portalId = process.env.PORTAL_ID
var formGuid = process.env.FORM_GUID
var hubDbTableId = process.env.HUBDB_TABLE_ID
var webhookBasicAuthPw = process.env.WEBHOOK_BASIC_AUTH_PW

function getMultiSelect (value) {
		var rawValues = value.split(';');
		var values = []
		rawValues.forEach(function(item) {
				values.push({"id":String(item),"type" : "option"});
		});
		return values;
	}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'HubSpot',hubid: portalId });
});

//use this route if you want to return HubDB values as JSON to the front end, you could also juse use the HubDB APIs directly
//originally created to support getting values across HubSpot portals
router.get('/get-table', function(req, res, next) {
	var options = {
		uri: `https://api.hubapi.com/hubdb/api/v1/tables/${hubDbTableId}/rows?portalId=${portalId}&hapikey=${hapikey}&limit=10`,
		method: 'GET'
		}
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			/*console.log(body);*/
			res.json(body);
		}
		else {
			return res.status(403).send("Error");
		}
	});
});

/*
1. Accepts post request
2. Gets authorization header from incoming webhook. Is base64 encoded
3. Only processes if your Basic auth pw matches that in your env file
4. Build multi select properties using getMultiSelect function
5. build HubDB API payload and map incoming HS contact properties to HubDB columns, uses lodash for error handling
6. Using request, send HTTP request to HubDB API
*/
router.post('/update-row', function(req,res,next){
	var auth = req.get("authorization");
	var credentials = new Buffer(auth.split(" ").pop(), "base64").toString("ascii").split(":");

	if (credentials[1]===`${webhookBasicAuthPw}`){
		var areas_of_expertise = getMultiSelect(_.get(req.body.properties,'areas_of_expertise.value',''));
		console.log(req.body.properties)
		var options = {
				uri: `https://api.hubapi.com/hubdb/api/v1/tables/${hubDbTableId}/rows?portalId=${portalId}&hapikey=${hapikey}`,
				method: 'POST',
				json: {
					"values": {
						    "1":_.get(req.body.properties,'city.value',''),
						    "2": _.get(req.body.properties,'firstname.value',''),
						    "3": _.get(req.body.properties,'lastname.value', ""),
						    "5": _.get(req.body.properties,'page_contact_email.value',''),
						    "8": _.get(req.body.properties,'twitterhandle.value',""),
						    "9": _.get(req.body.properties,'facebook_or_linkedin_link_.value',""),
						    "10": _.get(req.body.properties,'leader_since_year_.value', ""),
						    "11": {"url": _.get(req.body.properties,'leader_profile_picture.value', ""),"type": "image"},
						    "13": _.get(req.body.properties,'portal_link.value', ""),
						    "14": Number(_.get(req.body.properties,'event_date.value',"")),
						    "15": _.get(req.body.properties,'event_topic.value',""),
						    "16": _.get(req.body.properties,'event_description.value',""),
						    "27": _.get(req.body.properties,'secondary_leader.value',""),
						    "29": areas_of_expertise,
						    "30": _.get(req.body.properties,'leader_bio.value', ""),
						    "31": _.get(req.body.properties,'overview.value',""),
						    "32": _.get(req.body.properties,'event_registration_link.value',"")
					}
				}
			};
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('success in response');
			}
			else{
				console.log('in else in request');
				console.log(response.status,body);
			}
		});
		res.status(200).send('OK');
	}
	else {
		console.log('in else');
      // The user typed in the username or password wrong.
      return res.status(403).send("Access Denied (incorrect credentials)");
    }
});


module.exports = router;
