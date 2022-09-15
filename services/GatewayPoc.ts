import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import AuthGateway from './AuthGateway/AuthGateway';
import CustomerService from './CustomerService/CustomerService';
import PaymentService from './PaymentService/PaymentService';
import ServiceGateway from './ServiceGateway/ServiceGateway';

export class GatewayPocStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		//Create the services
		const paymentService = new PaymentService(this, 'PaymentService')
		const customerService = new CustomerService(this, 'CustomerService')


		//Create a Service Gateway and register the endpoint of each service
		const serviceGateway = new ServiceGateway(this, 'ServiceGateway', {
			endpoints: {
				'payments': paymentService.api.url,
				'customers': customerService.api.url
			}
		})

		//Create an Auth Gateway and register the Service Gateway
		new AuthGateway(this, 'Authorizer', { serviceGatewayUrl: serviceGateway.api.url })

	}
}
