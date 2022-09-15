import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { aws_lambda_nodejs, BundlingOutput } from 'aws-cdk-lib';


interface PaymentServiceProps {

}

export default class PaymentService extends Construct {

	public readonly api: apiGateway.RestApi;
	public readonly integration: LambdaIntegration;

	constructor(scope: Construct, id: string, props?: PaymentServiceProps) {
		super(scope, id);

		this.api = new apiGateway.RestApi(this, 'PaymentServiceApi');

		const layer = new LayerVersion(this, 'AuthorizerLayer', {
			code: Code.fromAsset(path.join(__dirname, 'src'), {
				exclude: ['*', '!package.json', '!package-lock.json'],
				bundling: {
					image: Runtime.NODEJS_14_X.bundlingImage,
					command: [
						'bash',
						'-c',
						[
							'mkdir /tmp/nodejs',
							'cd $_',
							'cp /asset-input/{package.json,package-lock.json} .',
							'npm ci',
							'cd /tmp',
							'zip -qr /asset-output/layer.zip nodejs',
						].join(' && ')
					],
					environment: { HOME: '/tmp/home' },
					outputType: BundlingOutput.ARCHIVED
				}
			})
		})

		const handler = new aws_lambda_nodejs.NodejsFunction(this, 'RequestHandler', {
			runtime: lambda.Runtime.NODEJS_14_X,
			entry: path.join(__dirname, 'src', 'handler.ts'),
			handler: 'handler',
			environment: {
				NODE_OPTIONS: '--enable-source-maps'
			},
			layers: [layer],
			bundling: {
				externalModules: ['aws-sdk'],
				sourceMap: true
			}
		})

		this.integration = new LambdaIntegration(handler)

		this.api.root
			.addMethod('ANY', this.integration)

		this.api.root
			.addResource('{proxy+}')
			.addMethod('ANY', this.integration)

	}
}