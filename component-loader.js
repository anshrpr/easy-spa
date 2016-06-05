;(function(window, Mustache){
	var loadedDependencies = {
		css:[],
		js:[],
		fonts:[]
	}

	var links = document.getElementsByTagName("link");
	for (var i = 0; i < links.length; i++) {
		if(links[i].href){
			loadedDependencies.css.push(links[i].href);
		}
	};

	var scripts = document.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		if(scripts[i].src){
			loadedDependencies.js.push(scripts[i].src);
		}
	};

	var ComponentLoader = function(){};
	var Component = function(config){
		config = config || {};

		this.init = config.init && typeof config.init == 'function'?config.init:null;
		this.update = config.update && typeof config.update == 'function'?config.update:null;
		this.template = config.template||null;
		this.dependencies = config.dependencies||null;
		this.template = config.template||null;
		this.render = config.render||render;
		this.data = config.data||{};

		this.template && loadTemplate(this.template);
	};

	ComponentLoader.prototype.load = function(component, params){
		if(component){
			params = params||{};
			var type = typeof component;

			var instance = null;
			if(type=='function'){
				instance = {
					init:component
				};
			}else if(type=='object'){
				instance = Object.assign({}, component);

				if(params.container && instance.template){
					instance.template = Object.assign({}, instance.template, {container:params.container});
				}
			}else{
				throw new Error("Unsupported component type '"+type+"'");
			}

			if(params.route){
				instance.route = Object.assign({}, params.route);
			}

			if(params.match){
				instance.route.match = params.match.path;
				instance.route.args = params.match.args;
			}

			if(component.dependencies){
				if(component.dependencies.css){
					var stylesheets = component.dependencies.css;
					for (var i = 0; i < stylesheets.length; i++) {
						if(loadedDependencies.css.indexOf(stylesheets[i]) === -1){
							var link = document.createElement('link');
							link.href = stylesheets[i];
							document.head.appendChild(link);
							loadedDependencies.css.push(stylesheets[i]);
						}
					};
				}

				if(component.dependencies.js){
					var scripts = component.dependencies.js;
					for (var i = 0; i < scripts.length; i++) {
						if(loadedDependencies.js.indexOf(scripts[i]) === -1){
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = scripts[i];
							document.head.appendChild(script);
							loadedDependencies.js.push(scripts[i]);
						}
					};
				}
			}

			instance.render && instance.render();
			instance.init && instance.init();
			
			return instance;
		}else{
			throw new Error("Component not provided");
		}
	}

	function render(data){
		if(this.template){
			if(this.template.html){
				data = data||this.data||{};

				var render = Mustache.render(this.template.html, data);

				if(this.template.container){
					if(this.template.append){
						this.template.container.appendChild(render);
					}else{
						this.template.container.innerHTML = render;
					}
				}

				return render;
			}else{
				throw new Error("Template HTML unavailable");
			}
		}
	}

	function loadTemplate(template){
		if(template.path){
			var xhr = new XMLHttpRequest();
			if(!xhr){
				throw new Error("XMLHttpRequest Unsupported");
				return false;
			}

			var path = template.path;
			xhr.onreadystatechange = function(){
				if(xhr.readyState === XMLHttpRequest.DONE){
					if(xhr.status == 200){
						template.html = xhr.responseText;
						parseTemplate(template.html);
					}else{
						throw new Error("Failed to load template '"+path+"'. Status Code "+xhr.status);
					}
				}
			}
			var path = window.ComponentLoader.templatePath?window.ComponentLoader.templatePath+path:path;
			xhr.open('GET', path);
			xhr.send();
		}else if(template.html){
			parseTemplate(template.html);
		}else{
			throw new Error("Template path or html not provided");
		}
	}

	function parseTemplate(html){
		Mustache.parse(html);
	}

	window.Component = Component;
	window.ComponentLoader = new ComponentLoader;
})(window, Mustache);