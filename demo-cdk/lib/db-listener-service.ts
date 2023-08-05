import { Construct } from 'constructs';

import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime,StartingPosition} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {DynamoEventSource} from "aws-cdk-lib/aws-lambda-event-sources";


export class DbListenerService extends Construct {

     distributionDomainName:string;

    constructor(scope: Construct, id: string,fileTable:Table) {
        super(scope, id);

        const nodeJsFunctionProps: NodejsFunctionProps = {
            runtime: Runtime.NODEJS_18_X,
        }

        const createOneLambda = new NodejsFunction(this, 'DbListenerFunction', {
            entry:  join(__dirname, `/../lambdas/db_listener.ts`) ,
            handler:'handler',
            ...nodeJsFunctionProps,
        });


        fileTable.grantReadWriteData(createOneLambda); // was: handler.role);


        createOneLambda.addEventSource(new DynamoEventSource(fileTable, {
            startingPosition: StartingPosition.LATEST,
        }))
    }
}