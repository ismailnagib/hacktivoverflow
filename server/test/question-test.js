process.env.STATUS = 'test'

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const Question = require('../models/questionModel')
const User = require('../models/userModel')
const app = require('../app')

chai.use(chaiHttp);

describe('Question', function () {

    let token = ''
    let id = ''

    this.beforeAll('Add dummy user to DB', function (done) {
        chai
        .request(app)
        .post('/users/register')
        .send({
            name: 'Author',
            email: 'author@question.com',
            password: 'password'
        })
        .end((err, res) => {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'author@question.com',
                password: 'password'
            })
            .end((err, res) => {
                token = res.body.token
                done()
            })
        })
    })
    
    this.afterAll('Remove dummy data from DB', function (done) {
        Question.deleteOne({
            title: 'Test'
        })
        .then(() => {
            User.deleteOne({
                email: 'author@question.com'
            })
            .then(() => {
                done()
            })
        })
    })

    describe('POST /questions/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .send({
                    title: 'Test',
                    content: 'Lorem ipsum'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
    
            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: 'invalid'
                })
                .send({
                    title: 'Test',
                    content: 'Lorem ipsum'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        })
        
        describe('=====> valid token', function () {

            it('valid input | should save a new question', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: token
                })
                .send({
                    title: 'Test',
                    content: 'Lorem ipsum'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)
                    expect(res.body.data).to.have.property('title')
                    expect(res.body.data).to.have.property('content')
                    expect(res.body.data.title).to.equal('Test')
                    expect(res.body.data.content).to.equal('Lorem ipsum')
                    id = res.body.data._id
                    done()
                })
            });
    
            it('no title | should return error 500', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: token
                })
                .send({
                    title: '',
                    content: 'Lorem ipsum'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a title')
                    done()
                })
            });
    
            it('no content | should return error 500', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: token
                })
                .send({
                    title: 'Test',
                    content: ''
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a content')
                    done()
                })
            });
    
            it('no title & no content | should return error 500', function(done) {
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: token
                })
                .send({
                    title: '',
                    content: ''
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a title and a content')
                    done()
                })
            });
        })
    })
    
    describe('GET /questions/', function () {

        it('without params | should return an array', function(done) {
            chai
            .request(app)
            .get('/questions/')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('array')
                expect(res.body.data).to.have.lengthOf(1)
                expect(res.body.data[0]).to.have.property('_id')
                expect(res.body.data[0]).to.have.property('title')
                expect(res.body.data[0]).to.have.property('content')
                expect(res.body.data[0]).to.have.property('author')
                expect(res.body.data[0].author).to.have.property('name')
                expect(res.body.data[0]._id).to.equal(id)
                expect(res.body.data[0].title).to.equal('Test')
                expect(res.body.data[0].content).to.equal('Lorem ipsum')
                expect(res.body.data[0].author.name).to.equal('Author')
                done()
            })
        })

        it('with params :id | should return an object', function (done) {
            chai
            .request(app)
            .get(`/questions/${id}/`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('object')
                expect(res.body.data).to.have.property('title')
                expect(res.body.data).to.have.property('content')
                expect(res.body.data).to.have.property('author')
                expect(res.body.data.author).to.have.property('name')
                expect(res.body.data._id).to.equal(id)
                expect(res.body.data.title).to.equal('Test')
                expect(res.body.data.content).to.equal('Lorem ipsum')
                expect(res.body.data.author.name).to.equal('Author')
                done()
            })
        })
    })

    describe('GET /questions/search/', function () {

        it('keyword = t | should return an array', function(done) {
            chai
            .request(app)
            .get(`/questions/search?keyword=t`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('array')
                expect(res.body.data).to.have.lengthOf(1)
                expect(res.body.data[0]).to.have.property('_id')
                expect(res.body.data[0]).to.have.property('title')
                expect(res.body.data[0]).to.have.property('content')
                expect(res.body.data[0]).to.have.property('author')
                expect(res.body.data[0].author).to.have.property('name')
                expect(res.body.data[0]._id).to.equal(id)
                expect(res.body.data[0].title).to.equal('Test')
                expect(res.body.data[0].content).to.equal('Lorem ipsum')
                expect(res.body.data[0].author.name).to.equal('Author')
                done()
            })
        })

        it('keyword = x | should return an empty array', function(done) {
            chai
            .request(app)
            .get(`/questions/search?keyword=x`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('array')
                expect(res.body.data).to.have.lengthOf(0)
                done()
            })
        })

        it('keyword = "" | should return an array', function(done) {
            chai
            .request(app)
            .get(`/questions/search?keyword=`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('array')
                expect(res.body.data).to.have.lengthOf(1)
                expect(res.body.data[0]).to.have.property('_id')
                expect(res.body.data[0]).to.have.property('title')
                expect(res.body.data[0]).to.have.property('content')
                expect(res.body.data[0]).to.have.property('author')
                expect(res.body.data[0].author).to.have.property('name')
                expect(res.body.data[0]._id).to.equal(id)
                expect(res.body.data[0].title).to.equal('Test')
                expect(res.body.data[0].content).to.equal('Lorem ipsum')
                expect(res.body.data[0].author.name).to.equal('Author')
                done()
            })
        })

        it('no keyword | should return an array', function(done) {
            chai
            .request(app)
            .get(`/questions/search`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.data).to.be.a('array')
                expect(res.body.data).to.have.lengthOf(1)
                expect(res.body.data[0]).to.have.property('_id')
                expect(res.body.data[0]).to.have.property('title')
                expect(res.body.data[0]).to.have.property('content')
                expect(res.body.data[0]).to.have.property('author')
                expect(res.body.data[0].author).to.have.property('name')
                expect(res.body.data[0]._id).to.equal(id)
                expect(res.body.data[0].title).to.equal('Test')
                expect(res.body.data[0].content).to.equal('Lorem ipsum')
                expect(res.body.data[0].author.name).to.equal('Author')
                done()
            })
        })
    })

    describe('PUT /questions/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .send({
                    title: 'The title was Test',
                    content: 'The content was Lorem ipsum',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)

                    // THIS ONE BELOW IS TO CHECK IF THE TITLE AND THE CONTENT ARE STILL THE SAME
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('title')
                        expect(res2.body.data).to.have.property('content')
                        expect(res2.body.data.title).to.equal('Test')
                        expect(res2.body.data.content).to.equal('Lorem ipsum')
                        done()
                    })
                })
            })
    
            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .set({
                    token: 'invalid'
                })
                .send({
                    title: 'The title was Test',
                    content: 'The content was Lorem ipsum',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)

                    // THIS ONE BELOW IS TO CHECK IF THE TITLE AND THE CONTENT ARE STILL THE SAME
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('title')
                        expect(res2.body.data).to.have.property('content')
                        expect(res2.body.data.title).to.equal('Test')
                        expect(res2.body.data.content).to.equal('Lorem ipsum')
                        done()
                    })
                })
            })
        })

        describe('=====> valid token', function () {

            it('valid input | should edit added question', function (done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .set({
                    token: token
                })
                .send({
                    title: 'The title was Test',
                    content: 'The content was Lorem ipsum',
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
    
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('title')
                        expect(res2.body.data).to.have.property('content')
                        expect(res2.body.data.title).to.equal('The title was Test')
                        expect(res2.body.data.content).to.equal('The content was Lorem ipsum')
                        done()
                    })
                })
            })
    
            it('no title | should return error 500', function (done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .set({
                    token: token
                })
                .send({
                    title: '',
                    content: 'The content was Lorem ipsum',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a title')
    
                    // THIS ONE BELOW IS TO CHECK IF THE TITLE IS STILL THE SAME
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('title')
                        expect(res2.body.data.title).to.equal('The title was Test')
                        done()
                    })
                })
            })
    
            it('no content | should return error 500', function (done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .set({
                    token: token
                })
                .send({
                    title: 'The title was Test',
                    content: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a content')
    
                    // THIS ONE BELOW IS TO CHECK IF THE CONTENT IS STILL THE SAME
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('content')
                        expect(res2.body.data.content).to.equal('The content was Lorem ipsum')
                        done()
                    })
                })
            })
    
            it('no title & no content | should return error 500', function (done) {
                chai
                .request(app)
                .put(`/questions/${id}`)
                .set({
                    token: token
                })
                .send({
                    title: '',
                    content: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A question has to have a title and a content')
    
                    // THIS ONE BELOW IS TO CHECK IF THE TITLE AND THE CONTENT ARE STILL THE SAME
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.be.a('object')
                        expect(res2.body.data).to.have.property('title')
                        expect(res2.body.data.title).to.equal('The title was Test')
                        expect(res2.body.data).to.have.property('content')
                        expect(res2.body.data.content).to.equal('The content was Lorem ipsum')
                        done()
                    })
                })
            })
        })
    })

    describe('DELETE /questions/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .delete(`/questions/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE QUESTION IS NOT DELETED
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.not.equal(null)
                        done()
                    })
                })
            })

            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .delete(`/questions/${id}`)
                .set({
                    token: 'invalid'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE QUESTION IS NOT DELETED
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.not.equal(null)
                        done()
                    })
                })
            })
        })

        describe('=====> valid token', function () {

            this.beforeAll('Add an answer to the question and a reply to the answer', function (done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: token
                })
                .send({
                    words: 'An answer',
                    questionId: id,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)

                    chai
                    .request(app)
                    .post('/answers/stack')
                    .set({
                        token: token
                    })
                    .send({
                        words: 'A reply',
                        answerId: res.body.data._id
                    })
                    .end((err, res2) => {
                        expect(res2).to.have.status(201)
                        done()
                    })
                })
            })
            
            it('should delete added question and all the answers associated with it', function(done) {
                chai
                .request(app)
                .delete(`/questions/${id}`)
                .set({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE QUESTION IS DELETED
                    chai
                    .request(app)
                    .get(`/questions/${id}`)
                    .end((err, res2) => {
                        expect(res2).to.have.status(200)
                        expect(res2.body.data).to.equal(null)

                        // THIS ONE BELOW IS TO CHECK IF THE ANSWERS ASSOCIATED WITH THE QUESTION ARE DELETED
                        chai
                        .request(app)
                        .get('/answers/')
                        .end((err, res3) => {
                            expect(res3).to.have.status(200)
                            expect(res3.body.data).to.be.a('array')
                            expect(res3.body.data).to.have.lengthOf(0)
                            done()
                        })
                    })
                })
            })
        })
    })
});