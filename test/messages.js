'use strict';

var should = require('should');
var sinon = require('sinon');
var MessagesController = require('../lib/messages');
var ltcLib = require('@owstack/ltc-lib');
var _ = require('lodash');

describe('Messages', function() {

  var privateKey = ltcLib.PrivateKey.fromWIF('cQwApHAg8hw9AZuxiU4a7g9kFWdaemhPxVZXWiAKgJTx6dPP32fN');
  var address = 'LXeTHMStABF4QAbKpxCF1mVp88T7WEnMDV';
  var badAddress = 'LXeTHMStABF4QAbKpxCF1mVp88T7WEnMDm';
  var signature = 'H9zj64aWhillxM4oI4T+KLeTUOcne8vIljoz1wTkP7eHWIJrk/TeYU9Xp3PTNdDoFbCIFeUFd+Pj1WVIKfxbgJE=';
  var message = 'cellar door';

  it('will verify a message (true)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(true);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('will verify a message (false)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': 'wrong message'
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(false);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('handle an error from message verification', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {
        'address': badAddress,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      status: status,
    };
    controller.verify(req, res);
    status.args[0][0].should.equal(400);
    send.args[0][0].should.equal('Unexpected error: Checksum mismatch. Code:1');
    done();
  });

  it('handle error with missing parameters', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {},
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      status: status
    };
    controller.verify(req, res);
    status.args[0][0].should.equal(400);
    send.args[0][0].should.match(/^Missing parameters/);
    done();
  });

});
