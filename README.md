
# Documentation

## Create an assertion
----
  Given some parameters, this method will create an Assertion (https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html#Assertion) and return the json formatted assertion and the front-end html version.

* **URL:**
/assertion

* **Method:**
  `POST` 
  
*  **URL Params:**
None

* **Data Params**

  **Required**
  
   "receiver": url of the person who's receiving the badge
   
   "receiverName": name / username of the receiver
   
   "sender": url of the person who's sending the badge
   
   "senderName": name / username of the sender
   
   "platform": which platform is being used to send the badge (e.g. Twitter, Facebook, ..)
   
   "reason": url to the post that references someone sending a badge
   
   "badgeclass": url of the badgeclass
   
   **Example body**
   
   `{"receiver": "https://twitter.com/bobD", "receiverName": "Bob D.", "sender": "https://twitter.com/susanna", "senderName": "Susanna", "platform": "twitter", "reason": "https://twitter/sometweet123", "badgeclass": "https://api.wisebadges.be/17qjf87j3kpz56" }`

* **Success Response:**
  * **Code:** 200 <br />
    **Content:** 
    `{ json: "https://api.wisebadges.be/assertion/5f15ab65a546d6ce7861b12e", html: "https://wisebadges.be/badge/5f15ab65a546d6ce7861b12e}`
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ error : "..." }`

  OR

  * **Code:** 500 INTERNAL ERROR <br />
    **Content:** `{ error : "..."}`


## Get all badgeclasses
----
  This will show a list of all possible badgeclasses.

* **URL:**
/badgeclasses

* **Method:**
  `GET` 
  
*  **URL Params:**
None

* **Data Params**
None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:**
  `{ "badgeclasses":[{ "id":"https://","tag":"yourockbadge" },{ "id":"https://", "tag":"testbadge" } ] }`
  
## Get all assertions
----
  This will show a list of all issued assertions.

* **URL:**
/assertions

* **Method:**
  `GET` 
  
*  **URL Params:**
None

* **Data Params**
None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:**
  `{ "assertions": ["https://", "https://" ] }`
  
## Get the issuer
----
  This will show a list of all issued assertions.

* **URL:**
/issuer

* **Method:**
  `GET` 
  
*  **URL Params:**
None

* **Data Params**
None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:**
    {
"@context": "https://w3id.org/openbadges/v2",
"type": "Issuer",
"id": "http://localhost:5000/issuer",
"name": "WISE Badges",
"url": "https://wisebadges.be",
"email": "wise@osoc.be",
"image": "http://wisebadges.wabyte.com/WiseBadges.png"
}

## Get a badgeclass
----
  This will show the details of a certain badgeclass (given an id)

* **URL:**
/badgeclass/:id

* **Method:**
  `GET` 
  
*  **URL Params:**
id: id of the badgeclass

* **Data Params**
None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:**
{
"criteria": { "narrative": "just testing"},
"@context": "https://w3id.org/openbadges/v2",
"type": "BadgeClass",
"name": "example",
"description": "just a test badge",
"image": "http://wisebadges.wabyte.com/WiseBadges.png",
"issuer": "http://localhost:5000/issuer",
"id": "http://localhost:5000/badgeclass/5f0ebd0ba72c486d5a56d849"
}

## Get an assertion
----
  This will show the details of an assertion (given an id)

* **URL:**
/assertion/:id

* **Method:**
  `GET` 
  
*  **URL Params:**
id: id of the assertion

* **Data Params**
None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:**
{
"recipient": {
  "type": "url",
  "hashed": false,
  "identity": "https://twitter.com/Sarah_VanDenB",
  "name": "@sarah_vandenb"},
"sender": {
  "identity": "https://twitter.com/fvspeybr",
  "name": "@fvspeybr"},
"evidence": {"id": "https://twitter.com/fvspeybr/status/1283302666005811200"},
"accepted": true,
"@context": "https://w3id.org/openbadges/v2",
"type": "Assertion",
"badge": "http://localhost:5000/badgeclass/5f0ebd0ba72c486d5a56d849",
"issuedOn": "2020-07-15T09:10:05+00:00",
"verification": {"type": "hosted"},
"id": "http://localhost:5000/assertion/5f0eea5ea37a3f29d3921aa8"
}


