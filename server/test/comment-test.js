process.env.STATUS = 'test'

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var Comment = require('../models/commentModel')
const Article = require('../models/articleModel')
const User = require('../models/userModel')
var app = require('../app')

chai.use(chaiHttp);

describe('Comment', function () {
    
    let token = ''
    let commenter = ''
    let articleId = ''
    let commentId = ''
    let commentId2 = ''

    this.beforeAll('Add dummy user & article to DB', function (done) {
        chai
        .request(app)
        .post('/users/register')
        .send({
            name: 'Commenter',
            email: 'commenter@article.com',
            password: 'password'
        })
        .end((err, res) => {
            commenter = res.body.data._id

            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'commenter@article.com',
                password: 'password'
            })
            .end((err, res2) => {
                token = res2.body.token
                
                chai
                .request(app)
                .post('/articles/')
                .set({
                    token: token
                })
                .send({
                    title: 'Comment Test',
                    content: 'Lorem ipsum'
                })
                .end((err, res3) => {
                    articleId = res3.body.data._id
                    done()
                })
            })
        })
    })

    this.afterAll('Remove dummy data from DB', function (done) {
        Comment.deleteMany({
            words: 'Comment Test',
        })
        .then(() => {
            Article.deleteOne({
                title: 'Comment Test'
            })
            .then(() => {
                User.deleteOne({
                    email: 'commenter@article.com'
                })
                .then(() => {
                    done()
                })
            })
        })
    })

    describe('POST /comments/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/comments/')
                .send({
                    words: 'Comment Test',
                    postId: articleId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        
            it('invalid token | should return error 500', function(done) {
                chai
                .request(app)
                .post('/comments/')
                .set({
                    token: 'invalid'
                })
                .send({
                    words: 'Comment Test',
                    postId: articleId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        })

        describe('=====> valid token', function () {
            
            it('valid input | should save a new comment', function(done) {
                chai
                .request(app)
                .post('/comments/')
                .set({
                    token: token
                })
                .send({
                    words: 'Comment Test',
                    postId: articleId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)
                    expect(res.body.data).to.have.property('words')
                    expect(res.body.data).to.have.property('commenter')
                    expect(res.body.data).to.have.property('level')
                    expect(res.body.data.words).to.equal('Comment Test')
                    expect(res.body.data.commenter).to.equal(commenter)
                    expect(res.body.data.level).to.equal(1)
                    commentId = res.body.data._id
                    done()
                })
            })

            it('no postId | should return error 500', function(done) {
                chai
                .request(app)
                .post('/comments/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    postId: '',
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
                .post('/comments/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    postId: articleId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A comment has to have a content')
                    done()
                })
            })

            

            it('no postId & no words | should return error 500', function(done) {
                chai
                .request(app)
                .post('/comments/')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    postId: '',
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

    describe('POST /comments/stack', function () {

        describe('=====> no / invalid token', function () {

            it('no token | should return error 500', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .send({
                    words: 'Comment Test',
                    commentId: commentId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })

            it('invalid token | should return error 500', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: 'invalid'
                })
                .send({
                    words: 'Comment Test',
                    commentId: commentId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    done()
                })
            })
        })

        describe('=====> valid token', function () {
            
            it('valid input | level 2 comment on a level 1 comment | should save a level 2 comment', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Comment Test',
                    commentId: commentId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201)
                    expect(res.body.data).to.have.property('words')
                    expect(res.body.data).to.have.property('commenter')
                    expect(res.body.data).to.have.property('level')
                    expect(res.body.data.words).to.equal('Comment Test')
                    expect(res.body.data.commenter).to.equal(commenter)
                    expect(res.body.data.level).to.equal(2)
                    commentId2 = res.body.data._id
                    done()
                })
            })
    
            it('valid input | level 2 comment on a level 2 comment | should return error 500', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Comment Test',
                    commentId: commentId2,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A comment may only be owned by an article or a level 1 comment')
                    done()
                })
            })
    
            it('no commentId | should return error 500', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Comment Test',
                    commentId: '',
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
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    commentId: commentId,
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    expect(res.body).to.have.property('message')
                    expect(res.body.message).to.equal('A reply has to have a content')
                    done()
                })
            })
    
            it('no commentId & no words | should return error 500', function (done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: '',
                    commentId: '',
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

    describe('DELETE /comments/', function () {

        describe('=====> no / invalid token', function () {
            
            it('no token | should return error 500', function(done) {
                chai
                .request(app)
                .delete(`/comments/${commentId}`)
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS NOT DELETED
                    chai
                    .request(app)
                    .get('/comments/')
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
                .delete(`/comments/${commentId}`)
                .set({
                    token: 'invalid'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS NOT DELETED
                    chai
                    .request(app)
                    .get('/comments/')
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

            let commentId3 = ''
            
            this.beforeAll('Add one more level 2 comment', function(done) {
                chai
                .request(app)
                .post('/comments/stack')
                .set({
                    token: token
                })
                .send({
                    words: 'Comment Test',
                    commentId: commentId,
                })
                .end((err, res) => {
                    commentId3 = res.body.data._id
                    done()
                })
            })

            it('delete level 2 comment | should only delete the level 2 comment', function(done) {
                chai
                .request(app)
                .delete(`/comments/${commentId3}`)
                .set({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS DELETED
                    chai
                    .request(app)
                    .get('/comments/')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.data).to.be.a('array')
                        expect(res.body.data).to.have.lengthOf(2) // CAUSE WE MADE 3 COMMENTS AND IT SHOULD ONLY DELETE 1
                        done()
                    })        
                })
            })

            it('delete level 1 comment | should delete the level 1 comment and all associated level 2 comments', function(done) {
                chai
                .request(app)
                .delete(`/comments/${commentId}`)
                .set({
                    token: token
                })
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    
                    // THIS ONE BELOW IS TO CHECK IF THE COMMENT IS DELETED
                    chai
                    .request(app)
                    .get('/comments/')
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