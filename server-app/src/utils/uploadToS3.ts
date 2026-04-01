
import { S3Client, PutObjectCommand} from "@aws-sdk/client-s3";

const s3= new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!
    }
});

export const uploadToS3= async (fileBuffer: Buffer, fileName: string)=>{

    try {

        const params ={
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `qrcodes/${fileName}`,
            Body: fileBuffer,
            ContentType: "image/png"
        };
        
        await s3.send(new PutObjectCommand(params));

        const fileUrl= `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/qrcodes/${fileName}`;

        return fileUrl;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload to s3");
    }

};