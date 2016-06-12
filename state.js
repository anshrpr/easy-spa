;(function(window){
	function deepCopy(source){
		var target = source;
		if(target && typeof target == 'object'){
			target = Array.isArray(target)?[]:{};

			for(key in source){
				target[key] = deepCopy(source[key]);
			}
		}

		return target;
	}

	var states = {};
	var subscribers = {};

	var State = function(){};

	State.prototype.subscribe = function(model, component){
		if(component.update && typeof component.update == 'function'){
			subscribers[model] = subscribers[model] || [];

			subscribers[model].push(component);

			return function(){
				subscribers[model].filter(function(cmp){
					return cmp!=component;
				});
			}
		}else{
			throw new Error("Component does not contain update() callback");
		}
	}

	State.prototype.set = function(model, state){
		if(states[model] != state){
			states[model] = state;

			if(subscribers[model]){
				for (var i = 0; i < subscribers[model].length; i++) {
					subscribers[model][i].update && subscribers[model][i].update.call(subscribers[model][i]);
					subscribers[model][i].update && subscribers[model][i].render && subscribers[model][i].render.call(subscribers[model][i]);
				};
			}
		}
	}

	State.prototype.get = function(model){
		return deepCopy(states[model] || null);
	}

	window.State = new State;
})(window);
