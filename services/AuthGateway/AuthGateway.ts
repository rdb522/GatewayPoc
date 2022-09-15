import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { aws_lambda_nodejs, BundlingOutput, Duration } from 'aws-cdk-lib';

interface AuthGatewayProps {
	serviceGatewayUrl: string
}

export default class AuthGateway extends Construct {

	constructor(scope: Construct, id: string, props: AuthGatewayProps) {
		super(scope, id);

		const api = new apiGateway.RestApi(this, 'AuthGateway');

		const layer = new LayerVersion(this, 'AuthorizerLayer', {
			code: Code.fromAsset(path.join(__dirname, 'src'), {
				exclude: ['*', '!package.json', '!package-lock.json'],
				bundling: {
					image: Runtime.NODEJS_14_X.bundlingImage,
					command: [
						'bash',
						'-c',
						[
							'mkdir /tmp/build',
							'cd $_',
							'cp /asset-input/{package.json,package-lock.json} .',
							'npm ci',
							'cd /tmp',
							'zip -qr /asset-output/layer.zip build',
						].join(' && ')
					],
					environment: { HOME: '/tmp/home' },
					outputType: BundlingOutput.ARCHIVED
				}
			})
		})

		const authorizeHandler = new aws_lambda_nodejs.NodejsFunction(this, 'AuthorizeHandler', {
			runtime: lambda.Runtime.NODEJS_14_X,
			entry: path.join(__dirname, 'src', 'handler.ts'),
			handler: 'handler',
			environment: {
				NODE_OPTIONS: '--enable-source-maps'
			},
			layers: [layer],
			bundling: {
				externalModules: ['aws-sdk'], //...axios, etc
				sourceMap: true
			}
		})

		const authorizer = new apiGateway.RequestAuthorizer(this, 'Authorizer', {
			handler: authorizeHandler,
			identitySources: [apiGateway.IdentitySource.queryString('user')],
			resultsCacheTtl: Duration.seconds(0)
		})

		api.root
			.addResource('{proxy+}')
			.addMethod('ANY', new HttpIntegration(`${props.serviceGatewayUrl}{proxy}`, {
				options: {
					requestParameters: {
						'integration.request.path.proxy': 'method.request.path.proxy',
						'integration.request.header.Authorization': 'context.authorizer.authHeader',
					}
				}
			}), {
				authorizer: authorizer,
				requestParameters: {
					"method.request.path.proxy": true
				}
			})

	}
}