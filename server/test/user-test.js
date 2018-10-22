process.env.STATUS = 'test'

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const User = require('../models/userModel')
const app = require('../app')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('User', function() {

    let id = ''
    
    this.afterAll('Remove dummy data from DB', function (done) {
        User.deleteOne({
            email: 'test@test.com'
        })
        .then(() => {
            done()
        })
    })

    describe('POST /users/register', function() {
        
        it('valid input | should add new user', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test@test.com',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(201)
                expect(res.body.data).to.have.property('_id')
                expect(res.body.data).to.have.property('name')
                expect(res.body.data).to.have.property('email')
                expect(res.body.data).to.have.property('password')
                expect(res.body.data.name).to.equal('Test')
                expect(res.body.data.email).to.equal('test@test.com')
                expect(bcrypt.compareSync('password',res.body.data.password)).to.equal(true)
                id = res.body.data._id
                done()
            })
        })

        it('same email | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test@test.com',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Email has been registered before')
                done()
            })
        })

        it('wrong email format | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input a valid email address')
                done()
            })
        })

        it('password with less than 6 character || should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test2@test.com',
                password: 'just5'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Password should contain at least 6 characters')
                done()
            })
        })

        it('wrong email format & password with less than 6 character | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test',
                password: 'just5'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input a valid email address')
                done()
            })
        })

        it('no name | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: '',
                email: 'test2@test.com',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your name')
                done()
            })
        })

        it('no name & no email | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: '',
                email: '',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your name')
                done()
            })
        })

        it('no input at all | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: '',
                email: '',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your name')
                done()
            })
        })

        it('no email | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: '',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input a valid email address')
                done()
            })
        })

        it('no email & no password | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: '',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input a valid email address')
                done()
            })
        })

        it('no password | should return error 500', function (done) {
            chai
            .request(app)
            .post('/users/register')
            .send({
                name: 'Test',
                email: 'test2@test.com',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Password should contain at least 6 characters')
                done()
            })
        })
    })

    describe('POST /users/login', function() {
        
        it('valid input | should return token', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'test@test.com',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('token')
                expect(res.body.token).to.be.a('string')
    
                jwt.verify(res.body.token, process.env.JWT_KEY, (err, decoded) => {
                    expect(decoded).to.have.property('id')
                    expect(decoded.id).to.equal(id)
                })
    
                done()
            })
        })

        it('unregistered email | should return error 500', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'unregistered',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Incorrect email and/or password')
                done()
            })
        })

        it('no email | should return error 500', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: '',
                password: 'password'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your email')
                done()
            })
        })
        
        it('wrong password | should return error 500', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'test@test.com',
                password: 'wrong'
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Incorrect email and/or password')
                done()
            })
        })

        it('no password | should return error 500', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: 'test@test.com',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your password')
                done()
            })
        })

        it('no email & no password | should return error 500', function(done) {
            chai
            .request(app)
            .post('/users/login')
            .send({
                email: '',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('You should input your email and password')
                done()
            })
        })
    })
});