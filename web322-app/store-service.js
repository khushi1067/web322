/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.

*  Name: Khushi Abhay Bhandari
*  Student ID: 106774235
*  Date: 6-12-2024
*  Vercel Web App URL: __assignment-3-8fshwx01j-khushi-bhandaris-projects-15087a2f.vercel.app
*  GitHub Repository URL: git@github.com:khushi1067/as2.git_
********************************************************************************/

const { Sequelize } = require('sequelize');

require('dotenv').config();
console.log('Database URL:', process.env.DATABASE_URL); 




var sequelize = new Sequelize("postgresql://khush_owner:0DGbjUQNwz8P@ep-steep-recipe-a5rdydk0.us-east-2.aws.neon.tech/khush?sslmode=require", {
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

module.exports = sequelize;


sequelize
  .authenticate()
  .then(() => {
    console.log('Connection established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });


const Item = sequelize.define('Item', {
  body: { type: Sequelize.TEXT, allowNull: false },
  title: { type: Sequelize.STRING, allowNull: false },
  itemDate: { type: Sequelize.DATE, allowNull: false },
  featureImage: { type: Sequelize.STRING, allowNull: true },
  published: { type: Sequelize.BOOLEAN, defaultValue: false },
  price: { type: Sequelize.DOUBLE, allowNull: false },
  category: { type: Sequelize.INTEGER, allowNull: true }
});

const Category = sequelize.define('Category', {
  category: { type: Sequelize.STRING, allowNull: false }
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch((err) => reject("unable to sync the database"));
  });
};

module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.getItemsByCategory = function (categoryId) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { category: categoryId }
    })
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { published: true }
    })
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.getPublishedItemsByCategory = function (categoryId) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        category: categoryId
      }
    })
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};


module.exports.getCategoryById = async function (categoryId) {
  try {
    const category = await Category.findByPk(categoryId); 
    return category; 
  } catch (err) {
    console.error('Error fetching category by ID:', err);
    throw 'Unable to fetch category by ID';
  }
};


module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { id: id }
    })
      .then((data) => {
        if (data.length > 0) resolve(data[0]);
        else reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = (itemData.published) ? true : false;

    for (let prop in itemData) {
      if (itemData[prop] === "") itemData[prop] = null;
    }

    itemData.itemDate = new Date();

    Item.create(itemData)
      .then(() => resolve())
      .catch(() => reject("unable to create item"));
  });
};

module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (let prop in categoryData) {
      if (categoryData[prop] === "") categoryData[prop] = null;
    }

    Category.create(categoryData)
      .then(() => resolve())
      .catch(() => reject("unable to create category"));
  });
};

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id: id }
    })
      .then(() => resolve())
      .catch(() => reject("Unable to delete category"));
  });
};

module.exports.deleteItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: { id: id }
    })
      .then(() => resolve())
      .catch(() => reject("Unable to delete item"));
  });
};
