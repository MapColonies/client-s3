/* eslint-disable @typescript-eslint/naming-convention */ // s3-client object commands arguments
import {
  HeadObjectCommand,
  HeadBucketCommand,
  HeadObjectCommandOutput,
  HeadBucketCommandOutput,
  PutObjectCommand,
  ObjectCannedACL,
  GetObjectCommand,
  DeleteObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getS3ClientConfig } from './config';

const S3_NOT_FOUND_ERROR_NAME = 'NotFound';

type HeadCommandType = 'bucket' | 'object';

export class S3ClientWrapper {
  private readonly s3Client: S3Client;

  public constructor(extendedConfig?: S3ClientConfig) {
    const config = getS3ClientConfig();
    this.s3Client = new S3Client({ ...config, ...extendedConfig, logger: console });
  }

  public async getObjectWrapper(bucketName: string, key: string): Promise<NodeJS.ReadStream> {
    // this.logger.debug({ msg: 'getting object from s3', key, bucketName });

    try {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
      const commandOutput = await this.s3Client.send(command);
      return commandOutput.Body as NodeJS.ReadStream;
    } catch (error) {
      const s3Error = error as Error;
      console.log(error);
      throw s3Error;
      // this.logger.error({ err: s3Error, msg: 'failed getting key from bucket', key, bucketName });
      // throw new S3Error(`an error occurred during the get of key ${key} from bucket ${bucketName}, ${s3Error.message}`);
    }
  }

  public async putObjectWrapper(bucket: string, key: string, body: Buffer, acl?: ObjectCannedACL | string): Promise<void> {
    // this.logger.debug({ msg: 'putting key in bucket', key, bucketName: bucket, acl });

    try {
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ACL: acl });
      await this.s3Client.send(command);
    } catch (error) {
      const s3Error = error as Error;
      throw s3Error;
      // this.logger.error({ err: s3Error, msg: 'failed putting key in bucket', acl, bucketName: bucket });
      // throw new S3Error(`an error occurred during the put of key ${key} on bucket ${bucket}, ${s3Error.message}`);
    }
  }

  public async deleteObjectWrapper(bucketName: string, key: string): Promise<boolean> {
    // this.logger.debug({ msg: 'deleting object from s3', key, bucketName });

    let hasSucceeded = true;

    try {
      const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
      await this.s3Client.send(command);
    } catch (error) {
      const s3Error = error as Error;
      // this.logger.error({ err: s3Error, msg: 'failed deleting key from bucket', key, bucketName });
      hasSucceeded = false;
    }

    return hasSucceeded;
  }

  public async validateExistance(type: HeadCommandType, value: string, bucket?: string): Promise<boolean> {
    const exists = type === 'bucket' ? await this.headBucketWrapper(value) : await this.headObjectWrapper(bucket as string, value);
    return exists !== undefined;
  }

  private async headBucketWrapper(bucket: string): Promise<HeadBucketCommandOutput | undefined> {
    // this.logger.debug({ msg: 'heading bucket', bucketName: bucket });

    try {
      const command = new HeadBucketCommand({ Bucket: bucket });
      return await this.s3Client.send(command);
    } catch (error) {
      const s3Error = error as Error;
      if (s3Error.name === S3_NOT_FOUND_ERROR_NAME) {
        return undefined;
      }

      throw s3Error;
      // this.logger.error({ err: s3Error, msg: 'failed to head bucket', bucketName: bucket });
      // throw new S3Error(`an error occurred during head bucket ${bucket}, ${s3Error.message}`);
    }
  }

  private async headObjectWrapper(bucket: string, key: string): Promise<HeadObjectCommandOutput | undefined> {
    // this.logger.debug({ msg: 'heading object', key, bucketName: bucket });

    try {
      const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
      return await this.s3Client.send(command);
    } catch (error) {
      const s3Error = error as Error;
      if (s3Error.name === S3_NOT_FOUND_ERROR_NAME) {
        return undefined;
      }

      throw s3Error;
      // this.logger.error({ err: s3Error, msg: 'failed to head objcet', bucketName: bucket, key });
      // throw new S3Error(`an error occurred during head object with bucket ${bucket} key ${key}, ${s3Error.message}`);
    }
  }
}
