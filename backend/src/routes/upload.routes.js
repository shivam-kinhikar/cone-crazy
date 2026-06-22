const express = require('express');
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.post('/product-image', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), upload.single('image'), uploadImage);
router.delete('/product-image', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), deleteImage);

module.exports = router;
