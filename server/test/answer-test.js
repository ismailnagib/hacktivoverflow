process.env.STATUS = 'test'

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var Answer = require('../models/answerModel')
const Question = require('../models/questionModel')
const User = require('../models/userModel')
var app = require('../app')

chai.use(chaiHttp);

describe('Answer', function () {
    
    let token = ''
    let answerer = ''
    let questionId = ''
    let answerId = ''
    let answerId2 = ''

    this.beforeAll('Add dummy user & question to DB', function (done) {
        chai
        .request(app)
        .post('/users/register')
        .send({
            name: 'Answerer',
            email: 'answerer@question.com',
            password: 'password'
        })
        .end((err, res) => {
            answerer = res.body.data._id

            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'answerer@question.com',
                password: 'password'
            })
            .end((err, res2) => {
                token = res2.body.token
                
                chai
                .request(app)
                .post('/questions/')
                .set({
                    token: token
                })
                .send({
                    title: 'Answer Test',
                    content: 'Lorem ipsum'
                })
                .end((err, res3) => {
                    questionId = res3.body.data._id
                    done()
                })
            })
        })
    })

    this.afterAll('Remove dummy data from DB', function (done) {
        Answer.deleteMany({
            words: 'Answer Test',
        })
        .then(() => {
            Question.deleteOne({
                title: 'Answer Test'
            })
            .then(() => {
                User.deleteOne({
                    email: 'answerer@question.com'
                })
                .then(() => {
                    done()
                })
            })
        })
    })

    describe('POST /answers/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .send({
                    words: 'Answer Test',
                    questionId: questionId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        
            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: 'invalid'
                })
                .send({
                    words: 'Answer Test',
                    questionId: questionId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        })

        describe('=====> valid token', function () {
            
            it('valid input | should save a new answer', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: token
                })
                .send({
                    words: 'Answer Test',
                    questionId: questionId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)
                    expect(res.body.data).to.have.property('words')
                    expect(res.body.data).to.have.property('answerer')
                    expect(res.body.data).to.have.property('level')
                    expect(res.body.data.words).to.equal('Answer Test')
                    expect(res.body.data.answerer).to.equal(answerer)
                    expect(res.body.data.level).to.equal(1)
                    answerId = res.body.data._id
                    done()
                })
            })

            it('no questionId | should return error 500', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    questionId: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('If you get this message, you must have changed something on the client side, please reload the page and try again.')
                    done()
                })
            })

            it('no words | should return error 500', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    questionId: questionId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('An answer has to have a content')
                    done()
                })
            })

            

            it('no questionId & no words | should return error 500', function(done) {
                chai
                .request(app)
                .post('/answers/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    questionId: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('If you get this message, you must have changed something on the client side, please reload the page and try again.')
                    done()
                })
            })
        })
    })

    describe('POST /answers/stack', function () {

        describe('=====> no / invalid token', function () {

            it('no token | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .send({
                    words: 'Answer Test',
                    answerId: answerId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })

            it('invalid token | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: 'invalid'
                })
                .send({
                    words: 'Answer Test',
                    answerId: answerId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        })

        describe('=====> valid token', function () {
            
            it('valid input | level 2 answer on a level 1 answer | should save a level 2 answer', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Answer Test',
                    answerId: answerId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)
                    expect(res.body.data).to.have.property('words')
                    expect(res.body.data).to.have.property('answerer')
                    expect(res.body.data).to.have.property('level')
                    expect(res.body.data.words).to.equal('Answer Test')
                    expect(res.body.data.answerer).to.equal(answerer)
                    expect(res.body.data.level).to.equal(2)
                    answerId2 = res.body.data._id
                    done()
                })
            })
    
            it('valid input | level 2 answer on a level 2 answer | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Answer Test',
                    answerId: answerId2,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('An answer may only be owned by a question or a level 1 answer')
                    done()
                })
            })
    
            it('no answerId | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Answer Test',
                    answerId: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('If you get this message, you must have changed something on the client side, please reload the page and try again.')
                    done()
                })
            })
    
            it('no words | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    answerId: answerId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A reply has to have a content')
                    done()
                })
            })
    
            it('no answerId & no words | should return error 500', function (done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    answerId: '',
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('If you get this message, you must have changed something on the client side, please reload the page and try again.')
                    done()
                })
            })
        })
    })

    describe('DELETE /answers/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .delete(`/answers/${answerId}`)
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS NOT DELETED
                    chai
                    .request(app)
                    .get('/answers/')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.be.a('array')
                        expect(res.body.data).to.have.lengthOf(2) // CAUSE WE MADE 2 COMMENTS
                    })
        
                    done()
                })
            })

            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .delete(`/answers/${answerId}`)
                .set({
                    token: 'invalid'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS NOT DELETED
                    chai
                    .request(app)
                    .get('/answers/')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.be.a('array')
                        expect(res.body.data).to.have.lengthOf(2) // CAUSE WE MADE 2 COMMENTS
                        done()
                    })
                })
            })
        })

        describe('=====> valid token', function () {

            let answerId3 = ''
            
            this.beforeAll('Add one more level 2 answer', function(done) {
                chai
                .request(app)
                .post('/answers/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Answer Test',
                    answerId: answerId,
                })
                .end((err, res) => {
                    answerId3 = res.body.data._id
                    done()
                })
            })

            it('delete level 2 answer | should only delete the level 2 answer', function(done) {
                chai
                .request(app)
                .delete(`/answers/${answerId3}`)
                .set({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS DELETED
                    chai
                    .request(app)
                    .get('/answers/')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.be.a('array')
                        expect(res.body.data).to.have.lengthOf(2) // CAUSE WE MADE 3 COMMENTS AND IT SHOULD ONLY DELETE 1
                        done()
                    })        
                })
            })

            it('delete level 1 answer | should delete the level 1 answer and all associated level 2 answers', function(done) {
                chai
                .request(app)
                .delete(`/answers/${answerId}`)
                .set({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS DELETED
                    chai
                    .request(app)
                    .get('/answers/')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.be.a('array')
                        expect(res.body.data).to.have.lengthOf(0) // CAUSE WE MADE 3 COMMENTS, WE SHOULD HAVE DELETED 1, AND IT SHOULD DELETE THE OTHER 2
                        done()
                    })        
                })
            })
        })
    })
})