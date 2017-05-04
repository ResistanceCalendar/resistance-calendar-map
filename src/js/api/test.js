/*
 * @author ben-pr-p
 *
 * This is not a real "test" – no output validation, etc.
 * It just uses the library to hit the endpoints and outputs the result
 * The validation is my eyes checking the console
 *
 * Intended to be run with Node
 */

const api = require('./index')

const go = async () => {
  const events = await api.get.events()
  console.log(events)

  const candidates = await api.get.candidates()
  console.log(candidates)

  const eventsForCori = await api.get.events({ candidate: 'coribush' })
  console.log(eventsForCori)

  const testEvent = {
    name: 'Test Event',
    intro: 'This is just a test event',
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    host_name: 'Ben Packer',
    host_email: 'ben.paul.ryan.packer@gmail.com',
    host_phone: '2147010869',
    time_zone: 'Pacific Time (US & Canada)',
    venue: {
      name: 'Test Arena',
      address: '22C West Wheelock Street',
      city: 'Hanover',
      state: 'NH'
    }
  }

  const testEventCreationResult = await api.create.event('coribush', testEvent)
  console.log(testEventCreationResult)

  const testRSVP = {
    email: 'ben.paul.ryan.packer@gmail.com',
    guests_count: 0,
    volunteer: false,
    phone: '2147010869',
    name: 'Ben Packer'
  }

  const testRSVPCreationResult = await api.create.rsvp(303, testRSVP)
  console.log(testRSVPCreationResult)
}

go().catch(console.error)
