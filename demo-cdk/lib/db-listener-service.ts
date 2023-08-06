import { Construct } from 'constructs';

import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime,StartingPosition} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {DynamoEventSource,S3EventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import * as iam from 'aws-cdk-lib/aws-iam';
import {Bucket} from "aws-cdk-lib/aws-s3";
const { Asset } = require('aws-cdk-lib/aws-s3-assets');


export class DbListenerService extends Construct {

     distributionDomainName:string;

    constructor(scope: Construct, id: string,fileTable:Table,dataBucket:Bucket,regionName:string) {
        super(scope, id);

        // Uploaded script to Amazon S3 as-is
        const scriptAsset = new Asset(this, 'VmProcessAsset', {
            path: join(__dirname, `/../python_script/vm_process.py`)
        });

        const dbListenerLambda = new NodejsFunction(this, 'DbListenerFunction', {
            entry:  join(__dirname, `/../lambdas/db_listener.ts`) ,
            handler:'handler',
            runtime: Runtime.NODEJS_18_X,
            environment: {
                'SCRIPT_OBJECT_URL': scriptAsset.s3ObjectUrl,
            }
        });



        fileTable.grantReadWriteData(dbListenerLambda);
        dataBucket.grantReadWrite(dbListenerLambda);
        scriptAsset.grantRead(dbListenerLambda);

        dbListenerLambda.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions:['ec2:*'],
            resources:['*']
        }));


        dbListenerLambda.addEventSource(new DynamoEventSource(fileTable, {
            startingPosition: StartingPosition.LATEST,
        }))
    }
}