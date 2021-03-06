'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const Album = require('../../models/album');
const Users = require('../../models/user');
const utils = require('../../utils/utils');
const roles = require('../../utils/roles').roles;
const userCreate = require('./userCreate');

chai.use(chaiHttp);
const albumsId = [];
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
  nick: 'album' + utils.uid(2),
  role: roles.user,
};

describe('Album router', () => {
  before((done) => {
    new Promise((resolve, reject) => {
      userCreate(testUser, (userObj) => {
        if (!userObj) {
          return reject('something wrong')
        }
        testUser.id = userObj._id;
        testUser.token = userObj.tokens[0].id;
        resolve ();
      });
    }).then(() => {
      const param = {
        userId: testUser.id,
        name: 'test' + utils.uid(2),
      }
      Album.save(param,(err, album) => {
        albumsId.push(album._id);
        return;
      });
    }).then(() => {
      const param = {
        userId: testUser.id,
        name: 'test2' + utils.uid(2),
      }
      Album.save(param,(err, album) => {
        albumsId.push(album._id);
        return;
      });
    }).then(() => {
      done();
    }).catch(() => {
      throw new Error('something go wrong');
    });
  });
  after(done => {
     Album.remove({ownerId: testUser.id}, (err) => {
       if (err)
         return null;

       Users.remove({_id: testUser.id}, (err) => {
         if (!err) {
           done();
         }
     });
     });
  });

  it('should get list of albums', (done) => {
    chai.request(api)
      .get('/album/list')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + testUser.token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('array');
        expect(res.body.data).to.have.lengthOf(2);
        done();
      });
  });

  it('shodul get album detail', (done) => {
    chai.request(api)
      .get('/album/' + albumsId[0])
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + testUser.token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });

  it('shodul get validation error', (done) => {
    chai.request(api)
      .post('/album/create')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + testUser.token)
      .send({name: 'test<2', description: '<dasd'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.error.should.be.a('array');
        expect(res.body.error).to.have.lengthOf(2);
        done();
      });
  });

  it('shodul create new album', (done) => {
    chai.request(api)
      .post('/album/create')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + testUser.token)
      .send({name: 'test3' + utils.uid(2)})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('object');
        done();
      });
  });

  it('shodul remove album', (done) => {
    chai.request(api)
      .delete('/album/' + albumsId[0])
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + testUser.token)
      .end((err, res) => {
        res.should.have.status(200);
        Album.findOne({_id: albumsId[0]}, (err, album) => {
          expect(err).to.be.a('null');
          expect(album).to.be.a('null');
          done();
        });
      });
  });
});
