/*
 * @author ben-pr-p
 *
 * Client for BNC event API build on top of superagent
 */

const request = require('superagent');
const tv4 = require('tv4');
let base = 'https://api.brandnewcongress.org';

const resolver = (resolve, reject) => (err, res) =>
  (err ? reject(err) : resolve(res.body));

const validate = {
  event: body =>
    tv4.validate(body, {
      required: [
        'name',
        'intro',
        'host_name',
        'host_email',
        'host_phone',
        'start_time',
        'end_time',
        'venue',
      ],
      type: 'object',
      properties: {
        name: {type: 'string'},
        intro: {type: 'string'},
        start_time: {type: 'string'},
        end_time: {type: 'string'},
        host_name: {type: 'string'},
        host_email: {type: 'string'},
        host_phone: {type: 'string'},
        end_time: {type: 'string'},
        time_zone: {type: 'string'},
        venue: {
          required: ['name', 'address', 'city', 'state'],
          type: 'object',
          properties: {
            name: {type: 'string'},
            address: {type: 'string'},
            city: {type: 'string'},
            state: {type: 'string'},
          },
        },
      },
    }),

  rsvp: body =>
    tv4.validate(body, {
      required: ['email', 'guests_count', 'volunteer', 'phone', 'name'],
      type: 'object',
      proprties: {
        email: {type: 'string'},
        guests_count: {type: 'string'},
        volunteer: {type: 'boolean'},
        phone: {type: 'string'},
        name: {type: 'string'},
      },
    }),
};

const get = {
  events: params =>
    new Promise((resolve, reject) => {
      request
        .get(`${base}/events`)
        .query(params)
        .end(resolver(resolve, reject));
    }),

  candidates: () =>
    new Promise((resolve, reject) => {
      request.get(`${base}/events/candidates`).end(resolver(resolve, reject));
    }),
};

const create = {
  event: (candidate, event) =>
    new Promise((resolve, reject) => {
      const ok = validate.event(event);
      if (!ok) return reject(tv4.error);

      request
        .post(`${base}/events/create`)
        .query({candidate})
        .send(event)
        .end(resolver(resolve, reject));
    }),

  rsvp: (eventId, rsvp) =>
    new Promise((resolve, reject) => {
      const ok = validate.rsvp(rsvp);
      if (!ok) return reject(tv4.error);

      request
        .post(`${base}/events/${eventId}/rsvp`)
        .send(rsvp)
        .end((err, res) => {
          if (
            err.response.body &&
            Array.isArray(err.response.body.validation_errors)
          ) {
            if (err.response.body.validation_errors[0].includes('signup_id')) {
              return resolve('You have already RSVPed');
            }
          }

          return resolver(resolve, reject)(err, res);
        });
    }),
};

module.exports = {get, create};
