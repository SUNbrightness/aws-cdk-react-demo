import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {DeploymentService} from "./deployment-service";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import {CfnOutput} from "aws-cdk-lib";
import {ApiService} from "./api-service";
import {DbListenerService} from "./db-listener-service";

export class DemoCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);




    //创建前端部署用的s3
    let deploymentService = new DeploymentService(this, 'deployment');


    //后端接受表单的API服务
    let apiService = new ApiService(this,'api');

    //监听DB插入的服务
    new DbListenerService(this,"dbListenerService",apiService.fileTable)




  }



}
