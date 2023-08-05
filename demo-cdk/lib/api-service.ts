import {Construct} from 'constructs';
import {AttributeType, StreamViewType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {CfnOutput, RemovalPolicy} from 'aws-cdk-lib';
import {NodejsFunction, NodejsFunctionProps} from 'aws-cdk-lib/aws-lambda-nodejs';
import {join} from 'path'
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import {Bucket} from "aws-cdk-lib/aws-s3";

const lambda = require("aws-cdk-lib/aws-lambda");

export class ApiService extends Construct {

    fileTable:Table;
    dataBucket:Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const primaryKey = 'id';

        this.fileTable = this.createFileTable(primaryKey);
        this.dataBucket = this.createApiDataService();

        const nodeJsFunctionProps: NodejsFunctionProps = {
            environment: {
                PRIMARY_KEY: primaryKey,
                TABLE_NAME: this.fileTable.tableName,
                BUCKET_NAME:this.dataBucket.bucketName
            },
            runtime: Runtime.NODEJS_18_X,
        }

            const createOneLambda = new NodejsFunction(this, 'FileTableFunction', {
            entry:  join(__dirname, `/../lambdas/create.ts`) ,
            handler:'handler',
            ...nodeJsFunctionProps,
        });

        const getUploadUrlLambda = new NodejsFunction(this, 'getUploadUrlFunction', {
            entry: join(__dirname, `/../lambdas/get_upload_url.ts`) ,
            ...nodeJsFunctionProps,
        });


        this.fileTable.grantReadWriteData(createOneLambda); // was: handler.role);
        this.dataBucket.grantReadWrite(getUploadUrlLambda);

        // Integrate the Lambda functions with the API Gateway resource
        const createOneIntegration = new LambdaIntegration(createOneLambda);
        const getUploadUrlIntegration = new LambdaIntegration(getUploadUrlLambda);


        // Create an API Gateway resource for each of the CRUD operations
        const api = new RestApi(this, 'FileTableApi', {
            defaultMethodOptions:{
                methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Credentials": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    }
                }]
            },
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowMethods: ['*'],
                allowHeaders: ['*'],
                allowCredentials:true

            },
            restApiName: 'FileTableApi',
            // In case you want to manage binary types, uncomment the following
            // binaryMediaTypes: ["*/*"],
        });



        const fileTableApi = api.root.addResource('file');
        fileTableApi.addMethod('POST', createOneIntegration);

        const getUploadUrlApi = api.root.addResource('getUploadUrl');
        getUploadUrlApi.addMethod('GET', getUploadUrlIntegration);

    }

    private  createFileTable(primaryKey:string) {
        return new Table(this, 'FileTable', {
            partitionKey: {
                name: primaryKey,
                type: AttributeType.STRING
            },
            tableName: 'FileTable',
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            /**
             *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new table, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will delete the table (even if it has data in it)
             */
            removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
        });
    }
    private createApiDataService():s3.Bucket {
        const dataBucket = new s3.Bucket(this, 'ReactDemoData', {
            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.PUT,
                    ],
                    allowedOrigins: ['*'],
                    allowedHeaders: ['*'],
                },
            ],
        });

        // 👇 grant access to bucket
        // dataBucket.grantRead(new iam.AccountRootPrincipal());

        new CfnOutput(this, 'DataBucketName', {
            value: dataBucket.bucketName,
            description: 'The name of the S3 data bucket',
            exportName: 'DataBucketName',
        });

        return dataBucket;
    }


}
