import { S3Client } from "@aws-sdk/client-s3";

// TODO: configure once R2 credentials are set
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

// TODO: Implement uploadToR2(key: string, buffer: Buffer, contentType: string)
// - Use PutObjectCommand to upload to R2
// - Return public URL from R2_PUBLIC_URL + key
