## @spon/core

`@spon/core` is a little framework used to asynchronous load javascript modules based on dom attributes.

## Getting started

Add the following code to your main javascript entry point (app.js)

```javascript
import { loadApp } from '@spon/core'

loadApp(document.body, {
	fetch: name => import(`@/behaviours/${name}`)
})
```

Create a html file with the following snippet

```html
<div data-behaviour="example" id="required-id">...</div>
```

`js/behaviours/example`

```javascript
/**
 * @function example
 * @param {Object} props
 * @property {HTMLElement} props.node
 * @return {Function} a function to unmount
 */
function example({ node }) {
	return () => {
		console.log('i am called when the module is destroyed')
	}
}

export default example
```

You can also set the module to only load at certain breakpoints:

```html
<div data-behaviour="example" id="required-id" data-query="(max-width: 1024px)">
	...
</div>
```

`example()` will only be called when the viewport is smaller than 1024px. Once the module is mounted and the viewport increases to greater than 1024 the returned function will be called. Use this to remove any event listeners or destroy any custom modules

```javascript
/**
 * @function example
 * @param {Object} props
 * @property {HTMLElement} props.node
 * @return {Function} a function to unmount
 */
function example({ node }) {
	const slide = new SomeSlideLibrary(node)

	return () => {
		slide.destroy()
	}
}

export default example
```

Behaviours with the 'data-keep-alive' attribute will not be destroyed when navigating betweeen pages. This is only valid if you are using ajax pagaination.

## @spon/domevents

`@spon/domevents` is a tiny wrapper around dom-delegate. It let's you write backbone styled event objects with event delegation.

Using the library directly:

```javascript
import domEvents from '@spon/domevents'

const { addEvents, removeEvents } = domEvents(document.body)

addEvents({
	'click [data-toggle-button]': (e, elm) => {
		e.preventDefault()
		elm.classList.toggle('is-active')
	},
	'mouseenter [data-toggle-button]': [
		(e, elm) => {
			e.preventDefault()
			elm.classList.toggle('is-active')
		},
		true // capture value
	]
})
```

If you are using `@spon/core` i suggest you use @spon/domevents via the `withDomEvents` plugin (plugins/withDomEvents). The plugin will automatically handle removing events on module destruction

```javascript
import { withPlugins } from '@spon/core'
import withDomEvents from '@/lib/withDomEvents'

/**
 * @function example
 * @param {Object} props
 * @property {HTMLElement} props.node
 * @property {Object} props.plugins
 * @property {Function} props.plugins.addEvents
 * @return {Function} a function to unmount
 */
function example({ node, plugins: { addEvents } }) {
	const slide = new SomeSlideLibrary(node)

	return () => {
		slide.destroy()
	}
}

export default withPlugins(withDomEvents)(example)
```

You can use as many plugins as you like with withPlugins high order function. ie `withPlugins(withDomEvents, device, inview)`

## Writing your own plugins

A plugin is a plain javascript function that receives a single object, and returns an object with various methods and values attached to it.

```javascript
import domEvents from '@spon/domevents'

/**
 * @function withDomEvents
 * @property {object} props
 * @property {HTMLElement} props.node the root node to attach events to
 * @property {function} props.register a function used to store the destroy method
 * @return {object}
 */
export default function withDomEvents({ node, register }) {
	const events = domEvents(node)
	// the function passed to the register function will be called when the module the plugin is attached to is destroyed
	register(events.removeEvents)
	return events
}
```

## Events

`@spon/core` comes with a global event emitter (it uses mitt internally)

```javascript
import { eventBus } from '@spon/core'

/**
 * @function example
 * @param {Object} props
 * @property {HTMLElement} props.node
 * @return {Function} a function to unmount
 */
function example({ node }) {
	const slide = new SomeSlideLibrary(node)

	eventBus.on('some:event', (...args) => {
		console.log(args)
	})

	return () => {
		slide.destroy()

		eventBus.off('some:event')
	}
}

export default example
```

see [here](https://github.com/developit/mitt) for more documentation.

## Advanced usage: Rematch integration

You’ll need to know how to use rematch to use this feature. Spon.js exposes a hook for subscribing to store updates. It uses the connect function to bind the store state and reducers to the module

/store/index.js

```javascript
import { init } from '@rematch/core'
import createRematchPersist from '@rematch/persist'
import { connectStore } from '@/core'
import * as models from './models/index'

const persistPlugin = createRematchPersist({
	whitelist: ['cart'],
	throttle: 1000,
	version: 1
})

const store = init({
	models: {
		...models
	},
	plugins: [persistPlugin]
})

// this creates a function that is used to bind modules to the store
export const connect = connectStore(store)

export default store
```

/behaviours/example

```javascript
import { withPlugins } from '@spon/core'
import { connect } from '@/store'
import { withDomEvents } from '@/plugins/withDomEvents'

// removed other code for brevity
function example({ node, addEvents, store, render }) {
	// this function will be called every time
	// the objects returned from the mapState
	// function change

	store.deleteItemFromCart(node.id)

	render(({ prevState, currentState }) => {
		// code written here should only
		// react to changes
		// you shouldn't be quering the dom
		// or making ajax requests
		// this is reactive code only!
	})
}

// get the cart state
const mapState = store => {
	return {
		cart: store.cart
	}
}
// get all of the cart actions
// note: I could have written the function above like this
const mapDispatch = ({ cart }) => ({ ...cart })

export default withPlugins(withDomEvents)(
	connect({
		mapState,
		mapDispatch
	})(basket)
)
```
