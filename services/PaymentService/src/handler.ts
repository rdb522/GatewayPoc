import { Context, APIGatewayProxyResult, APIGatewayEvent, Callback } from 'aws-lambda';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { app } from './app'

const publicKey = 
`-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEArGBClPz4jmy1JDINqK5anvTFI3n9Y52dC0Mw1u5m01kKDt+eRuqc
+zuGSokp9laTnmtp7BGPiJUDHri5036anmMtmacY9i3XqemEQFjYWmTXuIBT8X9R
Xt7Yv4P2Uqx7opxS2ppdFF77FD17Q6koymim/iakCN1LJswsvDN7/CTxPHXYgfmS
15LFEWUQoezaRW4kz+aWJwP6m6wEDZy+6sGVgd02fYuQ286A9JJj2H4jztPl4mdO
QQe1JwFn/NYW3WGaqzoGc/EklxbZMxQFwsBxL9GMCY43n0QXS/HrMjJY3XC5ClK0
jyUc4GTH1f995OqQ3UuQpJOmKMJvziGk5QIDAQAB
-----END RSA PUBLIC KEY-----`

export const handler =  function(event: APIGatewayEvent, context: Context, callback: Callback): void {

	const authHeader = event.headers['Authorization']

	if (!authHeader){
		callback("Could not verify token", { statusCode: 400 })
		return;
	}

	try {
		const token = authHeader.replace('Bearer ', '')
		var {sub, orgs, permissions} = jwt.verify(token, publicKey) as JwtPayload
	}
	catch(e){
		callback("Could not verify token", { statusCode: 400 })
		return;
	}

	var response = app.route(event.path, {
		id: sub!,
		orgs,
		permissions
	})

	callback(null, {
		statusCode: 200,
		body: JSON.stringify(response)
	})
}