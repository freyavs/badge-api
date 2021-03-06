import { Request, Response, NextFunction } from 'express';
import Assertion, { AssertionDocument } from '../models/assertion';
import Badgeclass, { BadgeclassDocument } from '../models/badgeclass';
const global = require('../bin/global');
const async = require('async');
const request = require('request');
const bakery = require('openbadges-bakery-v2');
const validator = require('express-validator');

//response type here is 'any' and not Response as middleware added fields are giving errors when using Response
exports.listAssertions = function (req: Request, res: any) {
  res.json(res.paginatedResults);
};

exports.showAssertionDetails = function (req: Request, res: Response) {
  Assertion.findById(req.params.id).exec(function (err: Error, assertion: AssertionDocument) {
    if (assertion == null) return res.status(404).send();
    res.json(assertion.toJSON());
  });
};

//use to validate the body of POST request
const validateAssertion = [
  validator
    .body('receiver')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Receiver identifier cannot be empty.')
    .isURL()
    .withMessage('Receiver should be a (valid) URL.'),

  validator
    .body('receiverName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Receiver name cannot be empty.'),

  validator
    .body('sender')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Sender identifier cannot be empty.')
    .isURL()
    .withMessage('Sender should be a (valid) URL.'),

  validator
    .body('senderName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Sender name cannot be empty.'),

  validator
    .body('reason')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Reason cannot be empty.')
    .isURL()
    .withMessage('Reason should be a (valid) URL linking to a Twitter/Facebook/... post.'),

  validator.body('platform').trim().isLength({ min: 1 }).withMessage('Platform cannot be empty.'),

  validator
    .body('badgeclass')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Badgeclass cannot be empty.')
    .isURL()
    .withMessage('Badgeclass should be a (valid) URL linking to the json of a badgeclass.')
];

exports.createAssertion = [
  validateAssertion,
  (req: Request, res: Response) => {
    const errors = validator.validationResult(req);
    let assertion = new Assertion({
      '@context': 'https://w3id.org/openbadges/v2',
      recipient: {
        type: 'url',
        hashed: false,
        identity: req.body.receiver,
        name: req.body.receiverName
      },
      type: 'Assertion',
      badge: req.body.badgeclass,
      issuedOn: new Date(),
      evidence: {
        id: req.body.reason,
        narrative:
          'Issued using ' +
          req.body.platform +
          ' by ' +
          req.body.senderName +
          ' (' +
          req.body.sender +
          ').'
      },
      verification: { type: 'hosted' },
      accepted: false
    });

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }
    assertion.save(function (err: Error) {
      if (err) return res.status(500).send();
      res.json({
        json: assertion.id,
        html: `${global.FRONTEND_URL}/detail/${assertion._id}`
      });
    });
  }
];

exports.acceptAssertion = function (req: Request, res: Response) {
  Assertion.findByIdAndUpdate(req.params.id, { $set: { accepted: true } }, { new: false })
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(500).send();
    });
};

exports.deleteAssertion = function (req: Request, res: Response) {
  Assertion.findByIdAndDelete(req.params.id, (err: Error, docs: any) => {
    if (err) return res.status(500).send();
    res.status(200).send();
  });
};

exports.addAnswerToAssertion = function (req: Request, res: Response) {
  if (!req.body.answer && req.body.answer !== '')
    return res.status(400).send({ error: 'No answer field specified.' });
  Assertion.findByIdAndUpdate(req.params.id, { $set: { answer: req.body.answer } }, { new: false })
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(500).send();
    });
};

// TODO: needs refactor
exports.getDownloadableBadge = function (req: Request, res: Response) {
  Assertion.findById(req.params.id).exec(function (err: Error, assertion: AssertionDocument) {
    if (err) res.status(500).send(err);
    if (assertion == null) {
      return res.status(404).send({ error: 'Assertion ID not found.' });
    }
    //assertion has a field badge which contains a URL to the badgeclass, here we are filtering the ID from the URL (it's the last part)
    Badgeclass.findById(assertion.badge.split('/').pop()).exec(function (
      err: Error,
      badgeclass: BadgeclassDocument
    ) {
      if (err) res.status(500).send(err);
      if (badgeclass == null) {
        return res.status(404).send({ error: 'No badgeclass found for this assertion.' });
      }
      async.waterfall([async.apply(getBadgeImage, badgeclass.image)], function (
        err: Error,
        badgeImage: any
      ) {
        if (err) return res.status(500).send(err);
        //also check if buffer isn't empty
        if (badgeImage == null || badgeImage.buffer.byteLength < 1) {
          return res.status(404).send({ error: 'No image found for this badgeclass.' });
        }
        bakery.bake(
          {
            image: badgeImage,
            assertion: assertion.toJSON()
          },
          function (err: Error, imageData: any) {
            if (err) res.status(500).send(err);
            res.set('Content-Type', 'image/png');
            res.set('Content-Disposition', 'attachment; filename=' + badgeclass.tag + '.png');
            res.set('Content-Length', imageData.length);
            res.end(imageData, 'binary');
            return;
          }
        );
      });
    });
  });
};

function getBadgeImage(image: String, callback: CallableFunction) {
  const options = {
    url: image,
    method: 'get',
    encoding: null
  };

  request(options, function (err: Error, res: Response, body: any) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, body);
    }
  });
}
