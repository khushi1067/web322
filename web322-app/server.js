/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.

*  Name: Khushi Abhay Bhandari
*  Student ID: 106774235
*  Date: 6-12-2024
*  Vercel Web App URL: __assignment-3-8fshwx01j-khushi-bhandaris-projects-15087a2f.vercel.app
*  GitHub Repository URL: git@github.com:khushi1067/as2.git_
********************************************************************************/
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const authData = require('./auth-service');
const stripJs = require('strip-js');

const clientSessions = require('client-sessions');

const app = express();

const exphbs = require('express-handlebars');

const Handlebars = require('handlebars');


const bcrypt = require('bcryptjs');




app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.)/, "") : route.replace(/\/(.)/, ""));
  app.locals.viewingCategory = req.query.category ? req.query.category : null; // Ensure category is set or null
  next();
});


app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  helpers: {
    navLink: function(url, options) {
      return `<li class="nav-item${url === options.data.root.activeRoute ? ' active' : ''}">
                  <a class="nav-link" href="${url}">${options.fn(this)}</a>
              </li>`;
    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
      }
      return lvalue != rvalue ? options.inverse(this) : options.fn(this);
    },
    safeHTML: function(context) {
      return context ? new Handlebars.SafeString(context) : "";
    }
  }
}));


app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));


cloudinary.config({
  cloud_name: 'dagl6ayla',
    api_key: '942819521975566',
    api_secret: 'aBfxbZdlSoBlHx5F3p-GOsV0Ov4',
    secure: true
});


//add category
  app.get('/categories/add', (req, res) => {
    res.render('addCategory'); 
  });

  //post add category
  app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
      .then(() => {
        res.redirect('/categories'); 
      })
      .catch((err) => {
        res.status(500).send("Unable to Add Category"); 
      });
  });

//delete category
  app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
      .then(() => {
        res.redirect('/categories'); 
      })
      .catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found"); // Handle errors
      });
  });



  
// Shop route 
app.get('/shop', async (req, res) => {
  let viewData = {};
  console.log("Category ID: ", req.query.category); // Log category ID for debugging
  try {
      let items = [];
      if (req.query.category) {
          // Fetch items by category if category is provided
          items = await storeService.getPublishedItemsByCategory(req.query.category);
          console.log("Items fetched for category:", items); // Log the fetched items
      } else {
          // Fetch all published items if no category is provided
          items = await storeService.getPublishedItems();
          console.log("Items fetched: ", items); // Log the fetched items
      }

      if (items.length === 0) {
          viewData.message = "No items found for the selected category";
      }

      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
      viewData.items = items;
      viewData.item = items[0]; // Latest item if any

  } catch (err) {
      viewData.message = "No items found";
      console.error("Error fetching items:", err);
  }

  try {
      viewData.categories = await storeService.getCategories();
  } catch (err) {
      viewData.categoriesMessage = "No categories available";
      console.error("Error fetching categories:", err);
  }

  res.render("shop", { data: viewData });
});


//items

  app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
      .then(() => {
        res.redirect('/items'); 
      })
      .catch((err) => {
        res.status(500).send("Unable to Remove Item / Item not found"); // Handle errors
      });
  });

const upload = multer();
app.get('/', (req, res) => {
  res.redirect('/about');// /shop
});

app.get('/about', (req, res) => {
  res.render('about');
});
  
  app.get('/items', async (req, res) => {
    let viewData = {};
  
    try {
      const items = await storeService.getAllItems();
      if (items.length > 0) {
        viewData.items = items;
      } else {
        viewData.message = "no results";
      }
    } catch (err) {
      viewData.message = "no results"; 
    }
  
    try {
      const categories = await storeService.getCategories();
      if (categories.length > 0) {
        viewData.categories = categories;
      } else {
        viewData.categoriesMessage = "no categories available";
      }
    } catch (err) {
      viewData.categoriesMessage = "no categories available"; // Handle promise rejection
    }
  
    res.render('items', { data: viewData });
  });
  
  app.get('/categories', async (req, res) => {
    let viewData = {};
  
    try {
      const categories = await storeService.getCategories();
      if (categories.length > 0) {
        viewData.categories = categories;
      } else {
        viewData.message = "no results";
      }
    } catch (err) {
      viewData.message = "no results"; 
    }
  
    res.render('categories', { data: viewData });
  });
  



  app.get('/items/add', (req, res) => {
    storeService.getCategories()
      .then((categories) => {
        res.render('addItem', { categories }); // Pass the categories to the view
      })
      .catch(() => {
        res.render('addItem', { categories: [] }); // Render with an empty array if no categories
      });
  });

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    }).catch((error) => {
      console.error('Upload failed:', error);
      res.status(500).send('Failed to upload image');
    });
  } else {
    processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then(() => {
      res.redirect('/items');
    }).catch((err) => {
      res.status(500).send('Failed to add item');
    });
  }
});

app.get('/items', (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    storeService.getItemsByCategory(category)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  } else if (minDate) {
    storeService.getItemsByMinDate(minDate)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  } else {
    storeService.getAllItems()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  }
});





// Start the server after initializing the store service and authentication service
storeService.initialize()
    .then(authData.initialize)  // Add this line to initialize the authentication service
    .then(() => {
        app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to initialize data:', err);
    });





  // Set up session middleware
app.use(clientSessions({
  cookieName: 'session', 
  secret: 'YOUR_SECRET_KEY', 
  duration: 24 * 60 * 60 * 1000, 
  activeDuration: 1000 * 60 * 60, 
  httpOnly: true, 
  secure: false, 
  ephemeral: true
}));
  

// Middleware to expose session object to views
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.userName) {
      return res.redirect('/login');
  }
  next();
}


// Apply ensureLogin to routes that require authentication
app.use('/items', ensureLogin);
app.use('/categories', ensureLogin);
app.use('/item', ensureLogin);
app.use('/category', ensureLogin);



//step 5


// GET /register
app.get('/register', (req, res) => {
  res.render('register');  // Render the register view (register.hbs)
});

// POST /register
app.post('/register', (req, res) => {
  // Call the registerUser function from authData to register the user
  authData.registerUser(req.body)
      .then(() => {
          // If successful, render the register view with a success message
          res.render('register', {
              successMessage: "User created"  // Success message
          });
      })
      .catch((err) => {
          // If error occurs, render the register view with an error message and the user's attempted userName
          res.render('register', {
              errorMessage: err,  // Error message
              userName: req.body.userName  // Keep the username in case of failure
          });
      });
});


// GET /login
app.get('/login', (req, res) => {
  res.render('login');  // Render the login view (login.hbs)
});


// Login Route (POST)
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
      .then((user) => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory
          };
          res.redirect('/items');
      })
      .catch((err) => {
          res.render('login', { errorMessage: err, userName: req.body.userName });
      });
});

// GET /logout
app.get('/logout', (req, res) => {
  // Reset the session to log out the user
  req.session.reset();  // This will clear the session data
  res.redirect('/');  // Redirect the user to the home page after logging out
});



app.get('/userHistory',(req,res)=>{
  res.render('userHistory',{user:req.session.user});
});



function ensureLogin(req, res, next) {
  if (!req.session.userName) {  // If no userName in session
      res.redirect('/login');  // Redirect to login if not logged in
  } else {
      next();  // Proceed to the next middleware or route handler
  }
}



// Define the port to use (you can choose PORT or HTTP_PORT)
const PORT = process.env.PORT || 8080;  // OR define HTTP_PORT if you prefer it






























    /*
app.get('/shop', async (req, res) => {
  let viewData = {};
  const category = req.query.category;
  const selectedItemId = req.query.id ? parseInt(req.query.id) : null;

  try {
    if (category) {
      viewData.posts = await storeService.getPublishedItemsByCategory(category);
    } else {
      viewData.posts = await storeService.getPublishedItems();
    }
  } catch (err) {
    viewData.posts = [];
    viewData.message = "No items available.";
  }

  try {
    viewData.categories = await storeService.getCategories();
  } catch (err) {
    viewData.categories = [];
    viewData.categoriesMessage = "No categories available.";
  }

  try {
    if (selectedItemId) {
      viewData.post = await storeService.getItemById(selectedItemId);
    } else {
      viewData.post = null;
    }
  } catch (err) {
    viewData.post = null;
    viewData.message = "Item not found.";
  }

  res.render('shop', { data: viewData });
});
  
  app.use((req, res) => {
    res.status(404).render('404');
});

app.get('/shop/:id', async (req, res) => {
  let viewData = {};
  const id = parseInt(req.params.id); 

  try {
    console.log("Fetching item with ID:", id); 
    const item = await storeService.getItemById(id);
    console.log("Item fetched:", item); 
    viewData.post = item;
  } catch (err) {
    console.error("Error fetching item:", err); 
    viewData.post = null;
    viewData.message = "Item not found.";
  }

  try {
    const items = await storeService.getPublishedItems();
    viewData.posts = items;
  } catch (err) {
    viewData.posts = [];
    viewData.message = "No items available.";
  }

  try {
    const categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categories = [];
    viewData.categoriesMessage = "No categories available.";
  }

  res.render('shop', { data: viewData });
});

*/

    /*
storeService.initialize()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
  });
})
.catch((err) => {
  console.log("Failed to initialize the store: " + err);
});
*/