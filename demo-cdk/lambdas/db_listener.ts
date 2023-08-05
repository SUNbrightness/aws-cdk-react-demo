import * as AWS from 'aws-sdk';
import {Handler} from "aws-cdk-lib/aws-lambda";
import {DynamoDBRecord, DynamoDBStreamEvent} from "aws-lambda";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler:Handler  = async (event: DynamoDBStreamEvent ): Promise<any> => {

    // @ts-ignore
    event.Records.forEach((record:DynamoDBRecord) => {
        let id = record.dynamodb?.NewImage?.['id'].S;
        let input_text = record.dynamodb?.NewImage?.['input_text'].S;
        let input_file_path = record.dynamodb?.NewImage?.['input_file_path'].S;


    });

};