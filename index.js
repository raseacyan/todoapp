var express = require('express');
var bodyParser = require('body-parser');
var firebase = require("firebase-admin");

//var serviceAccount = require("./fir-b7a51-firebase-adminsdk-t5w5o-853a416386.json");

firebase.initializeApp({
  credential: firebase.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "project_id": process.env.FIREBASE_PROJECT_ID,
  }),
  databaseURL: "https://fir-b7a51.firebaseio.com"
});

/*
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://fir-b7a51.firebaseio.com"
});*/

var db = firebase.database();

var itemsRef = db.ref("restricted_access/secret_document/items");

// The express app
var app = express();

var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});


// Create a router that can accept JSON
var router = express.Router();
router.use(bodyParser.json());

// Setup the collection routes
router.route('/')
      .get(function (req, res, next) {
          itemsRef.once("value", function(snapshot) {
            
            var arr = [];
            snapshot.forEach(function(data) {
                var obj = {}
                obj._id  = data.key ;
                obj.details = data.val().details;
                arr.push(obj);
            });

            res.send({
              status: 'Items found',
              items: arr
            });  

          });        
      })
      .post(function (req, res, next) {
          var item = req.body;         
          
          var newItemRef = itemsRef.push(item);          
          var itemId = newItemRef.key;
          
          res.send({
            status: 'Item added',
            itemId: itemId
          });
          
      })

// Setup the item routes
router.route('/:id')
      .delete(function (req, res, next) {
          var id = req.params['id'];
          
          var itemRemove = itemsRef.child(id);
          
          itemRemove.remove();

          res.send({ status: 'Item cleared' });

      });

app.use(express.static(__dirname + '/public'))
   .use('/todo', router);

