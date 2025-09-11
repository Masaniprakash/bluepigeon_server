const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded environment from:", envPath);
} else {
  console.log(
    "⚠️ No local .env file found. Using Heroku environment variables."
  );
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(file) {
  if (!file || !file.path) {
    throw new Error("Invalid file input");
  }

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now() + path.extname(file.originalname),
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
    ACL: "public-read"
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return uploadParams;
}

module.exports = { uploadToS3 };
