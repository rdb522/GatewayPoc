import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import { HttpIntegration } from 'aws-cdk-lib/aws-apigateway';


interface ServiceGatewayProps {
	endpoints: Record<string,string>
}

export default class ServiceGateway extends Construct {

	public readonly api: apiGateway.RestApi;

	constructor(scope: Construct, id: string, props: ServiceGatewayProps) {
		super(scope, id);

		this.api = new apiGateway.RestApi(this, 'ServiceGateway');

		Object.keys(props.endpoints).forEach(endpoint => {

			let url = props.endpoints[endpoint]

			if (url[url.length - 1] == '/'){
				url = url.slice(0, -1)
			}

			const resource = this.api.root.addResource(endpoint)

			resource
				.addMethod('ANY', new HttpIntegration(`${url}/`, {
					proxy: false, //This is necessary for some reason, not sure why this can't act as a proxy
					options: {
						requestParameters: {
							'integration.request.header.Authorization': 'method.request.header.Authorization',
						},
						integrationResponses: [
							{statusCode: '200'}
						]
					}
				}), {
					requestParameters: {
						'method.request.header.Authorization': false,
					},
					methodResponses: [
						{statusCode: '200'}
					]
				})

			resource
				.addResource('{proxy+}')
				.addMethod('ANY', new HttpIntegration(`${url}/{proxy}`, {
					proxy: false, //This is necessary for some reason, not sure why this can't act as a proxy
					options: {
						requestParameters: {
							'integration.request.header.Authorization': 'method.request.header.Authorization',
							'integration.request.path.proxy': 'method.request.path.proxy',
						},
						integrationResponses: [
							{statusCode: '200'}
						]
					}
				}), {
					requestParameters: {
						'method.request.header.Authorization': false,
						'method.request.path.proxy': true
					},
					methodResponses: [
						{statusCode: '200'}
					]
				})
		})

	}
}