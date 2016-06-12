# easy-spa
Easy SPA is a simple architecture for creating Single Page Applications with features inspired from other JS frameworks.

## Requirements
  - Mustache JS for templating (https://github.com/janl/mustache.js/)
  - Moderately efficient Brain

## Setup
At the bottom of the body tag, deep where there's nothing but darkness, include these scripts
```html
<script type="text/javascript" src="public/mustache.js"></script>
<script type="text/javascript" src="public/build.js"></script>
```
> Mustache JS is a dependency and must be included before build file

Now, anywhere before these script tags, inside the `body` (preferably in the beginning, where the sun shines the brightest), add an HTML element with id `content`. We expect that you are smart enough to know why ;)

```html
<div id="content"></div>
```

Next, define the routes using the `Router` module

```js
Router.add({
  path:"/",
  name:"default",
  component:{
    template:{
      html:"<h1>Hello, World</h1>"
    }
  }
})
```

Here, the route name `default` also means that this default route will be called if no other route matches.

You can also keep the template in a separate file and mentions the `path` property instead of `html`. We don't need to remind you that it's a `mustache` template.
```js
template:{
  path:"templates/default.mst"
}
```
The template will automatically be cached while adding the route. So there's no waiting, just real work.

You can define 2 callbacks for any component `init` and `update`.
```js
component:{
  template:{
    path:"templates/default.html"
  },
  init:function(){
    // Good place to perform some plugin initialisation and subscribe to states
    // init() is called after template is rendered for the first time, so you can refer to the HTML DOM elements
  },
  update:function(){
    // Called only when subscribed to any state, it also means that update is called only when a state change happens
    // More on the states later
    // Rendering is performed after the update() callback completes
  }
}
```

Finally, register the `Router` and voila! Your SPA is ready.
```js
Router.register();
```

# State

State is heavily inspired from the Flux architecture. The `State` object contains individual state for each model.
You can subscribe callbacks to the model's state for changes. And whenever the state changes, all of the subscribers are informed.

Setting a state is as simple as passing an object to the setter function
```js
var numbers = [1, 2, 3, 4];
State.set("numbers", numbers);
```
To fetch a state you can call the getter with the state name.
```js
var numbers = State.get("numbers");
```
> Note, State.get returns a deep copy of the original object. Modifying the returned object will not affect the one set in the State. Also, State.set deep copies the passed object before overriding the existing state which has the same effect as State.get. All this is just to avoid mutations, as mutations are ugly, except when its X-Men.

And lastly, subscribing to a state inside a component callback (`init` or `update`)
```js
State.subscribe("numbers", this);
```

Whenever a `State.set` is called a state change happens and thus the process of notifying the subscribers. So, now you know.

# Component and ComponentLoader
A component is a self container, reusable piece of object which acts as a controller, providing data to the view.
`Router` uses the component settings to initialise a component internally and use this component whenever route is called.

Here's everything you can do with a component.
```js
var counter = new Component({
  template:{
    html:"<p>Count: {{count}}</p>",
  },
  init:function(){
    State.subscribe("numbers", this);
  },
  update:function(){
    var numbers = State.get("numbers");
    this.data.count = numbers.length;
  }
});
```

Oh, did I forget to tell you about `this.data`. So, to pass the data from component to template, you can use `this.data`. The properties inside it will be directly available to the template and thus the syntax `{{count}}`.

You can also have other functions in the component which you may call from the callback functions using `this` keyword.

Now that your component is setup, it's time to load them up. This is optional though, as you may sometime want to have a component with no view. If that's the case, skip this step.

`ComponentLoader` provides `load` function to render the component to the DOM. You got to provide the container in which the template will be rendered, in any of the two ways, or both.

- First, inside the template setting.
```js
template:{
  html:"<p>Count: {{count}}</p>",
  container:document.getElementById("numbersCount")
}
```
- or, you can not mention it in template or if mentioned override it during the `ComponentLoader.load`
```js
// This will render in #numbersCount element
ComponentLoader.load(counter);
// And this, in #totalNumbers element
ComponentLoader.load(counter, {
  container:document.getElementById("totalNumbers");
});
```

Neat, isn't it? Now, get to work.
