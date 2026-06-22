const cloudinary = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');
const streamifier = require('streamifier');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'Please upload a file');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'icpms/products' },
      (error, result) => {
        if (error) {
          return errorResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, 'Image upload failed');
        }
        return res.status(STATUS_CODES.OK).json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'publicId is required');
    }
    
    await cloudinary.uploader.destroy(publicId);
    return successResponse(res, STATUS_CODES.OK, 'Image deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, deleteImage };
