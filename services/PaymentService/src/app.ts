interface User {id: string, orgs: string[], permissions: string[]}

interface Route {
	path: string
	permissions: Array<string>
	handler: (user: User, ...pathArgs: string[]) => any
}

const data: Array<{payment: string, organizationId: string}> = [
	{payment: '432', organizationId: '1'},
	{payment: '765', organizationId: '1'},
	{payment: '453', organizationId: '2'},
	{payment: '787', organizationId: '2'}
]

const routes: Route[] = [
	{
		path: '/',
		permissions: ['payments:list'],
		handler: (user: User) => ({
			data: data.filter(record => user.orgs.includes(record.organizationId))
		})
	},
	{
		path: '/{paymentId}/void',
		permissions: ['payments:update'],
		handler: (user: User, paymentId: string) => {
			return { data: `Voided ${paymentId} Successfully` }
		}
	}
]

function match(path: string, routes: Route[]){

	let matchedRoute: Route | null = null

	for (let i = 0; i < routes.length; i++){

		const route = routes[i]

		if (path === route.path){
			matchedRoute = route
			break;
		}
		
		const routePathPieces = route.path.replace(/{\w+}/g, '*').split('/')
		const pathPieces = path.split('/')

		for (let i = 0; i < routePathPieces.length; i++){
			if ( !(pathPieces[i] == routePathPieces[i] || routePathPieces[i] == '*') ){
				break;
			}
			if (i = routePathPieces.length - 1){
				matchedRoute = route
			}
		}

	}

	return matchedRoute
}

function checkPermissions(userPermissions: Array<string>, routePermissions: Array<string>){

	if (!routePermissions.length){
		return true
	}
	
	const permissionChecks = routePermissions.map(permission => {

		//Does user permission list have an exact listing?
		let result = !!userPermissions.find(userPermission => userPermission == permission)

		if (!result){
			//Does user permission list contain any entries with wildcards?
			const wildcardPermissions = userPermissions.filter(userPermission => userPermission.includes('*'))
			wildcardPermissions.forEach(wildcardPermission => {
				//Does the permission match up to the wildcard?
				const wildcardIndex = wildcardPermission.indexOf('*')
				if (wildcardPermission.substring(0, wildcardIndex) === permission.substring(0, wildcardIndex)){
					result = true
				}
			})
		}

		return result
	})

	if (permissionChecks.every(result => !!result)){
		return true
	}

	return false
}

function getPathParameters(path: string, route: Route){

	const parameters: string[] = []

	const routePathPieces = route.path.replace(/{\w+}/g, '*').split('/')
	const pathPieces = path.split('/')

	routePathPieces.forEach((piece, i) => {
		if (piece === "*"){
			parameters.push(pathPieces[i])
		}
	})

	return parameters;
}

export const app = {
	route(path: string, user: User){

		const route = match(path, routes)

		if (!route){
			return {
				statusCode: 404,
				body: "Endpoint Not Found"
			}
		}

		if (!checkPermissions(user.permissions, route.permissions)){
			return {
				statusCode: 401,
				body: "Insufficient Permissions"
			}
		}

		const pathParameters = getPathParameters(path, route)
		

		return route.handler(user, ...pathParameters)
		
	}
}