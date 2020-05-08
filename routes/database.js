const express = require('express');
const router = express.Router();

const data_controller = require('../controllers/dataControllers');

router.get('/', data_controller.index);


// GET request for creating data. NOTE This must come before routes that display data (uses id).
router.get('/data/create', data_controller.data_create_get);

// POST request for creating data.
router.post('/data/create', data_controller.data_create_post);

// GET request to delete data.
router.get('/data/:id/delete', data_controller.data_delete_get);

// POST request to delete data.
router.post('/data/:id/delete', data_controller.data_delete_post);

// GET request to update data.
router.get('/data/:id/update', data_controller.data_update_get);

// POST request to update data.
router.post('/data/:id/update', data_controller.data_update_post);

// GET request for one data.
router.get('/data/:id', data_controller.data_detail);

// GET request for list of all data items.
router.get('/data', data_controller.data_list);


module.exports = router;
