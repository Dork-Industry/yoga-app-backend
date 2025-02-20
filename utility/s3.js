const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadFile = (file, moduleName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${moduleName}_${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    return s3.upload(params).promise();
};

const getFile = async (key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };

    // return s3.getObject(params).promise();
    const url = await getSignedUrl(key);
    return url;
};

const deleteFile = (key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };

    return s3.deleteObject(params).promise();
};

const getSignedUrl = async (key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: 60 * 5, // URL expires in 5 minutes
    };

    try {
        const url = await s3.getSignedUrlPromise('getObject', params);
        return url;
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return null;
    }
}

module.exports = { uploadFile, getFile, deleteFile };