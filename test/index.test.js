//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
let config = require('config');

let mongoose = require("mongoose");

let {User} = require('../models/user');
let {Product} = require('../models/product');
let {Address} = require('../models/address');
let {Order} = require('../models/order');

let productData = require('./data/products.json');
let users = require('./data/users.json');

//Requiring the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let expect = require('chai').expect; 
let should = chai.should();
let server = require('./test_app');
const { describe } = require('mocha');

chai.use(chaiHttp);

describe("/api/users", () => {

  before(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Address.deleteMany({});
    
    await Product.insertMany(productData);
    await User.insertMany(users);
  });

 

  it("should connect and disconnect to mongodb", async () => {
    // console.log(mongoose.connection.states);
    mongoose.disconnect();
    mongoose.connection.on('disconnected', () => {
      expect(mongoose.connection.readyState).to.equal(0);
    });
    mongoose.connection.on('connected', () => {
      expect(mongoose.connection.readyState).to.equal(1);
    });
    mongoose.connection.on('error', () => {
      expect(mongoose.connection.readyState).to.equal(99);
    });

    await mongoose.connect(config.DBHost, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
  });
  });

  let authToken;
  let products;
 
  /*
  Test the /POST in /api/users route   - create new user / signup 
  */
  describe('/POST users signup', () => {      
        it('required all fields', (done) => {
               let user = {
                "password": "password",
                "firstName": "ishwar",
                "lastName": "soni",
                "email": "ishwar.soni@upgrad.com",
                "contactNumber": "1234567890"
            };
                chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a('object');  
                      res.body.should.have.property('_id');
                      res.body.should.have.property('firstName');
                      res.body.should.have.property('lastName');
                      res.body.should.have.property('email');
                      res.body.should.have.property('password');
                      res.body.should.have.property('contactNumber');
                      res.body.should.have.property('role');
                      res.body.should.have.property('createdAt');
                      res.body.should.have.property('updatedAt');
                      done();
                });
        });
  });

  /*
  Test the /POST in /api/auth route   - login user / signin
  */
  describe('login auth', () => {
    it('login response with isAuthenticated field', (done) => {
      let userData = {"email": "admin@upgrad.com",
      "password": "password"}
      chai.request(server)
      .post('/api/auth')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(200);     
        res.body.should.be.a('object');
        res.body.should.have.property('email');
        res.body.should.have.property('name');
        res.body.should.have.property('isAuthenticated');
        authToken = res.headers["x-auth-token"];
        done();
      });
    });
  });


  /*
  * Test the /POST in /product route - save product with auth
  */
  describe('/POST /api/products', () => {
    it("Should save Product", async() => {
    
            chai.request(server)
            .post("/api/products")
            .set("x-auth-token",authToken)
            .send({
              "name": "automotive product",
              "category": "Automotive",
              "price": 1000,
              "description": "This is a cool automotive product",
              "manufacturer": "Automotive manufacturer",
              "availableItems": 20,
              "imageURL": "https://5.imimg.com/data5/SELLER/Default/2021/6/MF/ZE/KO/131369908/motul-7100-4t-10w40-motor-oil-500x500.jpg"
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              //console.log(res.body)
            })
    })
  });
  
  /*
  * Test the /GET in /product route - get all products or search product
  */
  describe('/GET /api/products', () => {
    it("Should get all Products", async() => {

            chai.request(server)
            .get("/api/products")
            .send({
              "category":"Electronics",
              "direction":"desc",
              "name":"",
              "sortBy":"price",
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('array');
              products = res.body;
            })
    })
  });


  /*
  * Test the /GET in /product route - get all product categories
  */
  describe('/GET - /products/categories', () => {
    it("Should get all Product categories", async() => {

            chai.request(server)
            .get("/api/products/categories")
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('array');
              //console.log(res.body)
            })
    })
  });

   /*
  * Test the /GET in /product route - get Product by Product ID
  */
  describe('/GET - /products/{id}', () => {
    it("Should get  Product by product ID", async() => {

      let productId = products[2]._id; // change array value to get different product
        //console.log(productId)
      chai.request(server)
      .get(`/api/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
      })
    })
  });

   /*
  * Test the /PUT in /product route - update product with auth
  */
   describe('/PUT /api/products/{id}', () => {
    it("Should update Product details", async() => {

      let productId = products[0]._id;

            chai.request(server)
            .put(`/api/products/${productId}`)
            .set("x-auth-token",authToken)
            .send({
              "name": "Motul 104103 7100 4T Fully Synthetic 20W-50 Petrol Engine Oil for Bikes (1 L)",
              "category": "Automotive",
              "price": 700,
              
              "description": `Vehicle Compatibility: KTM Duke 200 / Bajaj Pulsar 200 NS, Pulsar 220, Pulsar 180, Pulsar 150, Avenger 220 DTS-i
              100% Synthetic with ester 4-Stroke engine oil.`,
              
              "manufacturer": "Motul",
              "availableItems": 100,
              "imageURL": "https://5.imimg.com/data5/SELLER/Default/2021/6/UZ/OY/YZ/131369908/facewin-whitening-cream.JPG"
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              
            })
    })
  });

  let productId;

   /*
  * Test the /DELETE in /product route - Delete product with auth
  */
   describe('/DELETE /api/products/{id}', () => {
    it("Should Delete Product details", async() => {

       productId = products[1]._id;

            chai.request(server)
            .delete(`/api/products/${productId}`)
            .set("x-auth-token",authToken)
            .end((err, res) => {
              expect(res).to.have.status(200);
              //console.log(res.body)
            })
    })
  });

   /*
  * Test the /POST in /addresses route - Add Address with auth
  */
 
  

   describe('/POST /api/addresses', () => {
    it("Should Add address", async() => {

        chai.request(server)
        .post(`/api/addresses`)
        .set("x-auth-token",authToken)
        .send({
          "name": "John",
          "contactNumber": 9091929394,
          "city": "WinterFell",
          "zipCode": 123456,
          "landmark": "Castle",
          "state": "The North",
          "street": "The Castle Street",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          //console.log(res.body)
        })
    })
  });

let addressId;
     /*
  * Test the /GET in /addresses route - Get Address with auth
  */
     describe('/GET /api/addresses', () => {
      it("Should Get address", async() => {
  
          chai.request(server)
          .get(`/api/addresses`)
          .set("x-auth-token",authToken)
          .end((err, res) => {
            expect(res).to.have.status(200);
            addressId = res.body[0]._id;
          })
      })
    });


    /*
  * Test the /POST in /orders route - Add Orders with auth
  */
    describe('/POST /api/orders', () => {
      it("Should Add order", async() => {
  
          chai.request(server)
          .post(`/api/orders`)
          .set("x-auth-token",authToken)
          .send({
            "address": addressId,
            "product": products[0]._id,
            "quantity": 1
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            //console.log(res.body)
          })
      })
    });


});