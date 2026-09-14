const cloudinary = require('../config/cloudinary');

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'neighborhood-issues', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

module.exports = { uploadBuffer };
