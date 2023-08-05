import * as AWS from 'aws-sdk';
import {Handler} from "aws-cdk-lib/aws-lambda";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const { nanoid } = require('nanoid');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler:Handler  =async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const responseData={headers: {
        'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
    }};


    if (!event.body) {
        return { ...responseData,statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    item[PRIMARY_KEY] = nanoid();
    const params = {
        TableName: TABLE_NAME,
        Item: item
    };

    try {
        await db.put(params).promise();
        return {  ...responseData,statusCode: 200, body: '' };
    } catch (dbError) {
        // @ts-ignore
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return {  ...responseData,statusCode: 500, body: errorResponse };
    }
};

