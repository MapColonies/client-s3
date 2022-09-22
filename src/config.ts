import * as env from 'env-var';
import { S3ClientConfig } from '@aws-sdk/client-s3';

const DEFAULT_REGION = 'us-east-1';
const DEFAULT_FORCE_PATH_STYLE = 'true';

export const getS3ClientConfig = (): S3ClientConfig => {
  const config: S3ClientConfig = {
    endpoint: env.get('S3_ENDPOINT').asString(),
    region: env.get('S3_REGION').default(DEFAULT_REGION).asString(),
    forcePathStyle: env.get('S3_FORCE_PATH_STYLE').default(DEFAULT_FORCE_PATH_STYLE).asBool(),
  };

  return config;
};
