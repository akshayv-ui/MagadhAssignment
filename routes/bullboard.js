const { createBullBoard } = require('@bull-board/api');
const { ExpressAdapter } = require('@bull-board/express');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const sendEmailQueue = require('../queues/sendMailqueue').sendEmailQueue;

const serverAdapter = new ExpressAdapter();

const queues = [sendEmailQueue].map(queue => (new BullAdapter(queue)));

serverAdapter.setBasePath('/api/queues');

createBullBoard({ queues, serverAdapter });

exports.bullBoardController = serverAdapter.getRouter();