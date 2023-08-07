import * as AWS from 'aws-sdk';
import {DynamoDBRecord, DynamoDBStreamEvent, Handler} from "aws-lambda";
import { EC2Client,RunInstancesCommand } from "@aws-sdk/client-ec2";


const REGION_NAME = process.env.AWS_REGION || '';
const SCRIPT_OBJECT_URL = process.env.SCRIPT_OBJECT_URL || '';


const client = new EC2Client({ region: REGION_NAME});


async function newVMProcess(fileId:string) {
    const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
    const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
    const AWS_SESSION_TOKEN = process.env['AWS_SESSION_TOKEN'];



    let vmProcessScript = `#!/bin/bash
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID};
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY};
export AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN};
export INSTANCE_ID=$(ec2-metadata -i | cut -d ' ' -f 2);
sudo yum install python3-pip -y;
sudo pip3 install boto3;
aws s3 cp ${SCRIPT_OBJECT_URL} vm_process.py;
python3 vm_process.py ${REGION_NAME} ${fileId};
    `

    const bufferString = Buffer.from(vmProcessScript).toString("base64");

    const command = new RunInstancesCommand({
        //Amazon Linux 2023 AMI 2023.1.20230725.0 x86_64 HVM kernel-6.1
        ImageId: "ami-02ca3c305687c64bb",
        // free type.
        InstanceType: "t3.micro",
        // KeyName:'i7_13700k',
        // SecurityGroupIds: ['sg-0e2ea4386e45b8e56'],
        // Ensure only 1 instance launches.
        MinCount: 1,
        MaxCount: 1,
        UserData:bufferString
    });

    try {
        console.log(vmProcessScript);
        const response = await client.send(command);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

export const handler:Handler  = async (event: DynamoDBStreamEvent,context): Promise<any> => {

    let record = event.Records[0];
    if(record.eventName!='INSERT'){
        return ;
    }

    let id = record.dynamodb?.NewImage?.['id'].S;
    let input_text = record.dynamodb?.NewImage?.['input_text'].S;
    let input_file_path = record.dynamodb?.NewImage?.['input_file_path'].S;
    // console.log(JSON.stringify(process.env));
    await newVMProcess(<string>id);
};