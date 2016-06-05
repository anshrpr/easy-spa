;(function(window, Component, ComponentLoader){
	var registered = {
		regex:[],
		names:[],
		components:[],
		routes:[]
	}

	var _router = null;

	Router = function(){
		_router = this;
		this.routes = {};
	}

	Router.prototype.register = function(){
		this.register = undefined;
		window.onhashchange = router;
		router();
	}

	var pageContent = document.getElementById('content');

	if(pageContent == undefined){
		throw new Error("Page content element undefined");
	}

	Router.prototype.add = function(options){
		if(options.path){
			var route = parse(options.path);
			route.name = options.name||Date.now();

			if(options.component){
				if(options.component.template){
					options.component.template.replace = true;
					options.component.template.container = pageContent;
				}

				registered.components.push(
					new Component(options.component)
				);
				registered.names.push(route.name);
				registered.regex.push(route.regex);
				registered.routes.push(route);

				this.routes[route.name] = route;
			}else{
				throw new Error("Route component undefined");
			}
		}else{
			throw new Error("Route path undefined");
		}

		return this;
	}

	Router.prototype.routeTo = function(routeName, args){
		window.location.hash = this.linkTo(routeName, args);
	}

	Router.prototype.linkTo = function(routeName, args){
		args = args || {};
		if(this.routes[routeName]){
			var route = this.routes[routeName];
			var path = route.link;
			if(route.params.length == Object.keys(args).length){
				for (var i = 0; i < route.params.length; i++) {
					if(args[route.params[i].name]){
						path = path.replace('{'+route.params[i].name+'}', args[route.params[i].name]);
					}else{
						throw new Error("Route parameter '"+route.params[i].name+"' not provided");
					}
				};
			}else{
				throw new Error("Insufficient route parameters");
			}

			return path;
		}else{
			throw new Error("Route does not exist");
		}
	}

	function router(){
		var path = window.location.hash.substring(1);

		var matchedRoute = false;

		for (var i = 0; i < registered.routes.length; i++) {
			matchedRoute = match(registered.routes[i], path);
			if(matchedRoute){
				break;
			}
		};

		if(matchedRoute){
			var routeName = registered.routes[i].name;

			ComponentLoader.load(registered.components[i], {
				route:_router.routes[routeName],
				match:matchedRoute
			});
		}else if(registered.names.includes('default')){
			_router.routeTo('default');
		}else{
			throw new Error("No matching route defined");
		}
	}

	function match(route, path){
		var match = path.match(new RegExp('^'+route.regex+'$'));

		if(match){
			var matchedParams = match.slice(1);
			var args = {};

			if(route.params.length){
				for (var i = 0; i < route.params.length; i++) {
					args[route.params[i].name] = matchedParams[i];
				};
			}

			return {
				path:path,
				args:args
			}
		}

		return false;
	}

	function parse(path){
		var original = path;
		var link = path;
		var pathParams = path.match(/{[^\/]*}/g);
		var routeParams = [];

		if(pathParams){
			for (var i = 0; i < pathParams.length; i++) {
				var paramExpr = pathParams[i].replace(/{|}/g, '');
				paramExpr = paramExpr.split(':');

				if(paramExpr.length == 1){
					paramExpr[1] = '\\w+';
				}

				link = link.replace(pathParams[i], '{'+paramExpr[0]+'}');
				path = path.replace(pathParams[i], '('+paramExpr[1]+')');

				routeParams.push({
					name:paramExpr[0],
					expr:paramExpr[1]
				});
			};
		}

		return {
			regex:path,
			original:original,
			link:link,
			params:routeParams
		}
	}

	window.Router = new Router;
})(window, Component, ComponentLoader);