import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path'
import { BundlingOutput, Duration, Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';


interface CustomerServiceProps {

}

export default class CustomerService extends Construct {

	public readonly api: apiGateway.RestApi;
	public readonly integration: LambdaIntegration;

	constructor(scope: Construct, id: string, props?: CustomerServiceProps) {
		super(scope, id);

		this.api = new apiGateway.RestApi(this, 'CustomerServiceApi');

		const handler = new lambda.Function(this, 'lambda-function', {
			runtime: lambda.Runtime.DOTNET_6,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: 'CustomerService',
			code: lambda.Code.fromAsset(path.join(__dirname, 'src', 'CustomerService'), {
				bundling: {
					image: Runtime.DOTNET_6.bundlingImage,
					command: [
						"bash",
						"-c",
						[
							"mkdir /tmp/build",
							"cd $_",
							"cp -R /asset-input/* .",
							"export DOTNET_CLI_HOME=\"/tmp/DOTNET_CLI_HOME\"",
							"export PATH=\"$PATH:/tmp/DOTNET_CLI_HOME/.dotnet/tools\"",
							"dotnet tool install -g Amazon.Lambda.Tools",
							"dotnet lambda package -o output.zip",
							"unzip -o -d /asset-output output.zip"
						].join(' && ')
					]
				}
			}),
		});

		this.integration = new LambdaIntegration(handler)

		this.api.root
			.addMethod('ANY', this.integration)

		this.api.root
			.addResource('{proxy+}')
			.addMethod('ANY', this.integration)

	}
}