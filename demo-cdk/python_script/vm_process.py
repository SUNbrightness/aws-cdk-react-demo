import boto3
import sys
import os
REGION_NAME = sys.argv[1]
FILE_ID = sys.argv[2]

INSTANCE_ID = os.environ.get('INSTANCE_ID')

tableName = 'FileTable'
dynamodb = boto3.resource('dynamodb', region_name=REGION_NAME)
s3 = boto3.client('s3', region_name=REGION_NAME)
ec2 = boto3.client('ec2', region_name=REGION_NAME)
table = dynamodb.Table(tableName)


# find fileTable by id
response = table.get_item(
    Key={
        'id': FILE_ID,
    }
)
item = response['Item']
input_text = item['input_text']
input_file_path = item['input_file_path']
[bucketName,fileName] = str(input_file_path).split('/')

# download file from s3
s3.download_file(bucketName, fileName, fileName)
# append to original file
with open(fileName,'a') as f:
    f.write(input_text)
# upload to s3
output_file_path  = 'out_'+fileName
s3.upload_file(fileName, bucketName, output_file_path)

#update DB
table.update_item(
    Key={
        'id': FILE_ID,
    },
    UpdateExpression='SET output_file_path = :val1',
    ExpressionAttributeValues={
        ':val1': bucketName+'/'+ output_file_path
    }
)
# terminate instances

response = ec2.terminate_instances(
    InstanceIds=[
        INSTANCE_ID,
    ],
)
print(response)