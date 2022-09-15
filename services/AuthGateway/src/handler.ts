import { AuthResponse, APIGatewayRequestAuthorizerHandler } from 'aws-lambda'
import jwt from 'jsonwebtoken'

interface User {
	permissions: Array<string>
	orgs: Array<string>
}

export const data: Record<string, User> = {
	'globalAdmin': {
		permissions: [
			'*'
		],
		orgs: ['1','2']
	},
	'org1Admin': {
		permissions: [
			'customers:list*',
			'payments:*'
		],
		orgs: ['1']
	},
	'org1User': {
		permissions:  [
			'customers:list',
			'payments:list'
		],
		orgs: ['1']
	},
	'org2Admin': {
		permissions: [
			'customers:list*',
			'payments:list',
			'payments:update'
		],
		orgs: ['2']
	},
	'org2User': {
		permissions:  [
			'customers:list',
			'payments:list',
			'payments:update'
		],
		orgs: ['2']
	}
}

export const handler: APIGatewayRequestAuthorizerHandler = function(event, context, callback) {
	var queryStringParameters = event.queryStringParameters;
	let id = queryStringParameters?.user

	if (!id || !data[id]){
		callback('Unauthorized')
		return
	}

	const claims = data[id]
	callback(null, generateAuthResponse(id, event.methodArn, tokenize(id, claims)))
}

function tokenize(subject: string, payload: any) : string {
	return jwt.sign(
		payload,
		privateKey(),
		{
			subject,
			algorithm: "RS256",
			expiresIn: 360000,
			issuer: "AuthGateway",
			audience: "Internal"
		}
	);
}

function generateAuthResponse (principalId: string, resource: string, token: string): AuthResponse {
	return {
		principalId,
		policyDocument:{
			Version: '2012-10-17',
			Statement: [
				{
					Action: 'execute-api:Invoke',
					Effect: 'Allow',
					Resource: resource
				}
			]
		},
		context: {
			"authHeader": `Bearer ${token}`
		}
	}
}

function privateKey(){
	return `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArGBClPz4jmy1JDINqK5anvTFI3n9Y52dC0Mw1u5m01kKDt+e
Ruqc+zuGSokp9laTnmtp7BGPiJUDHri5036anmMtmacY9i3XqemEQFjYWmTXuIBT
8X9RXt7Yv4P2Uqx7opxS2ppdFF77FD17Q6koymim/iakCN1LJswsvDN7/CTxPHXY
gfmS15LFEWUQoezaRW4kz+aWJwP6m6wEDZy+6sGVgd02fYuQ286A9JJj2H4jztPl
4mdOQQe1JwFn/NYW3WGaqzoGc/EklxbZMxQFwsBxL9GMCY43n0QXS/HrMjJY3XC5
ClK0jyUc4GTH1f995OqQ3UuQpJOmKMJvziGk5QIDAQABAoIBAFE1LEj6gLLAffom
Zo7wTRsT34geIYT7rQ+wQOMQ/3pUOUvWh7+LKhel7FdTFWTLVtJMcmNXxpIm+YhQ
qKL9wyQZP1NjCHx6Dl8q9zZFZO/5EDQIqQNd4tzaCaz4I2TBg6GRGeuIy48cTBc1
+8tddy0cbofPdnoCnzQQ/oZPjvqzOq4pVO8sLDi83g1zkLwX3uinEeQEWgLYLOjx
uYbY6HuNYzc7Si9Iu4lWDcFIsnyE6Sme6+uKtX8AXqusHOhoec3iKHXBza4EgwGt
WY2dqW5b2PZuuZk9s6rLxIpn5XFFKLMannb0jgxUNkdrp94fWXZP+2dHUfQBQW+x
HDDdSIECgYEA2fZAa5RbcGqTu/5VyoeOEtfzOqyBNk4wSvqDlAr6JX+yLCzOBmSU
NOe3hFqr+vw9h79RZfVwJsKbKLDRbvtpzrFKGrb0TCERuFbAlgB4bjTcfg5GvuH8
9ir2yVsw6Nu3GB4o9BAN0gp6t34ipUpxWzW/mC+f68mQbejKHA6aQGECgYEAynVl
QARrHzWbuLxItR7mkaDJwQL/xSi/QgGy6xFmEZEFDqr63KnpHarL3XBdOorRezar
eMhnLA57Sy6u7WKFgt1hg+KTfXtxA1iA9BjaRF2QtW6Bp9W2FDhVkXtGwJOZ9OLX
BnWHw5eGz+qBOPm4+Qnyog4R2fF7FhTADcBlQwUCgYEA1Ec1LpFrDO1/vNRUEdA7
2rZfuYFQxucXua6Kf6DBR8w6ZzOr5CYJAg27ejgkz2jjNFZsnHSSKe3W16Z+Eyzh
O+EHX0VYYNzEOVikcHM813i8VjjpRfcrO0VU3X7m/6Mdi2u0Tx9jlnGGWzeJ3pnG
FSMf2sRnaGkDNUhHr1O5f4ECgYAHhOinwgJAfHs2FzgUEfu6OOCFXJknN2YzC2Eb
vd+uk1Y+vzbl7yGLSoabyMqNnA4/pz4jFD5QspD9r9QrWNdgjtxKS6XyqRz/ZNAV
QL8Kfvca5enG0/cZNSZoas2r5U94etxFjyPlrcECA9GczhmClk3+mssq7v8FSOwB
Fr4sCQKBgETzYdDV6nj+J7SXQg6fYEYwtrPj/dMych0VxpmaxmB9V/t3rGHAKfOO
Op12WJx7z0KFx1Yo5wOR8utiQeZLQ34Ytv4jZM4XqO9j092CrMcDVnU5QXlEfexa
TBsbETCslUUjA27lKO8AQMWyGu+CDOcVBOFTG/ISQ7jQYLtkz+ef
-----END RSA PRIVATE KEY-----`
}

function publicKey(){
	return `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEArGBClPz4jmy1JDINqK5anvTFI3n9Y52dC0Mw1u5m01kKDt+eRuqc
+zuGSokp9laTnmtp7BGPiJUDHri5036anmMtmacY9i3XqemEQFjYWmTXuIBT8X9R
Xt7Yv4P2Uqx7opxS2ppdFF77FD17Q6koymim/iakCN1LJswsvDN7/CTxPHXYgfmS
15LFEWUQoezaRW4kz+aWJwP6m6wEDZy+6sGVgd02fYuQ286A9JJj2H4jztPl4mdO
QQe1JwFn/NYW3WGaqzoGc/EklxbZMxQFwsBxL9GMCY43n0QXS/HrMjJY3XC5ClK0
jyUc4GTH1f995OqQ3UuQpJOmKMJvziGk5QIDAQAB
-----END RSA PUBLIC KEY-----`
}