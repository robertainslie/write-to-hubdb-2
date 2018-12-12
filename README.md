# Submit Data to HubDB Table

##Steps to utilize
1. After forking, create a .env file to store your key=value pairs of sensitive keys, including HubID, HAPI key, HubDB table ID, etc
2. Define the HubDB table fields in the /update-row route (the HubDB API uses numeric column values)
3. Create a HubSpot Workflow that fires a webhook to your app endpoint ({base_url}/update-row) - likely using the starting criteria of "Form submission | [choose form]" - allow for HS Workflow re-enrollment
4. Add a Basic Auth Password and store in your .env file
5. Map the properties from your HubSpot Contact record (database names) to the proper HubDB table row ID (defined in the /update-row route)

The main /update-row route works via these steps:
1. Accepts post request
2. Gets authorization header from incoming webhook. Is base64 encoded
3. Only processes if your Basic auth pw matches that in your env file
4. Build multi select properties using getMultiSelect function
5. build HubDB API payload and map incoming HS contact properties to HubDB columns, uses lodash for error handling
6. Using request, send HTTP request to HubDB API
