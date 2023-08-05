# 项目简介
## 目录结构
- react_ui react前端项目
- demo-cdk 利用aws cdk完成的构建

## 开发环境
- windows 11
- aws cdk 2.89.0 (build 2ad6683)
- node.js v18.17.0

# 启动步骤
1. 电脑完成cdk授权 Region:ap-east-1
2. cmd 进入 demo-cdk 目录，执行`npm install`，进入demo-cdk/lambdas ，执行`npm install`
3. 在 demo-cdk 目录下，执行 `cdk deploy`
4. 复制输出的网关公网地址 DemoCdkStack.apiFileTableApiEndpointB66E4EB8，替换 react_ui/.env 中的 'REACT_APP_API_GATEWAY' 路径
5. cmd 进入 react_ui 目录，执行`npm install`,`npm run build` 打包react页面
6. 执行`aws s3 sync build/ s3://frontend-bucket--bcc3f20`, 上传打包好的前端页面至S3
7. 打开步骤 3 输出的 'DemoCdkStack.deploymentCloudFrontURL05BF422F' 地址 
