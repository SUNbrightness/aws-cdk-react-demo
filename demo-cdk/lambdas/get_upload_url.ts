import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();
const responseData={headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    }};

const BUCKET_NAME = process.env.BUCKET_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // get the name of the file to be uploaded
    const key = event.queryStringParameters?.key;
// generate a 10 (60 sec. * 10) minutes URL
    var params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: 600
    };
    console.log(BUCKET_NAME)

    var url = await s3.getSignedUrlPromise('putObject', params);

    return {
        ...responseData,
        statusCode: 200,
        body: JSON.stringify(
            {
                url,
            },
            null,
            2,
        ),
    };
};