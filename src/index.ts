import { Tracing } from '@map-colonies/telemetry';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { trace as traceAPI, context as contextAPI } from '@opentelemetry/api';
import { Logger } from '@map-colonies/js-logger';
import { getS3ClientConfig } from './config';
import { S3ClientWrapper } from './client';

const func = async (): Promise<void> => {
  const s3ClientWrapper = new S3ClientWrapper();
  const res = await s3ClientWrapper.getObjectWrapper('osmdbt', 'state.txt');
  console.log(res);

  // await s3Client.send(new ListBucketsCommand({})).then((data) => {
  //   console.log(data);
  // });

  span.end();
  await tracing.stop();
};

const tracing = new Tracing([
  new AwsInstrumentation({
    preRequestHook: (span, request): void => {
      console.log('preRequestHook');
      console.log('preRequestHook', span, request);
      span.setAttribute('s3.bucket.name', request.request.commandInput['Bucket']);
    },
  }),
]);

const tracer = traceAPI.getTracer('client-s3');
tracing.start();
const span = tracer.startSpan('test');
span.setAttribute('test', 'test');

const mainContext = traceAPI.setSpan(contextAPI.active(), span);
void contextAPI.with(mainContext, () => func);
