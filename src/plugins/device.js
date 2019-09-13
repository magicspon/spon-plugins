import throttle from 'raf-throttle'

// @ts-check

/**
 * @module plugin/device
 */

// an object to store all the resize handles
const handles = {}

/**
 * @memberOf device
 * @function addWindowResizeEvent
 * @description Adds a window resize event, and calls each item in the handles stack
 * @param {function} fn
 * @param {string} key
 * @return {void}
 */
function addWindowResizeEvent(fn, key) {
	if (!handles[key]) {
		handles[key] = fn
	}
	if (!addWindowResizeEvent.isRunning) {
		const handle = throttle(() => {
			const entries = Object.entries(handles)
			entries.forEach(([, item]) => {
				if (typeof item === 'function') {
					item()
				}
			})

			if (entries.length === 0) {
				window.removeEventListener('resize', handle)
				addWindowResizeEvent.isRunning = false
			}
		})

		if (Object.entries(handles).length) {
			window.addEventListener('resize', handle)
			addWindowResizeEvent.isRunning = true
		}
	}
}

/**
 *
 * @property {Boolean} isRunning
 */
addWindowResizeEvent.isRunning = false

/**
 * @memberOf device
 * @description remove event listeners
 * @param {Array} fns
 * @return {void}
 */
function removeWindowResizeEvent(fns) {
	fns.forEach(fn => {
		delete handles[fn]
	})
}

/**
 * @function device
 * @property {object} props
 * @property {string} props.name the module name
 * @property {function} props.register a function used to store the destroy method
 * @return {deviceType}
 */

/**
 * @typedef {Object} deviceType
 * @property {Object} device - plugin namespace
 * @property {Function} device.resize - The resize funciton
 * @property {Function} device.cancel - Cancel a resize event
 * @property {function} device.at - The resize funciton
 * @property {Number} device.width - The resize funciton
 * @property {Number} device.height - The resize funciton
 */

export default function device({ register, name }) {
	let mql
	let handle
	let localList = []

	register(() => {
		removeWindowResizeEvent(localList)
		if (mql) mql.removeListener(handle)
	})

	return {
		device: {
			/**
			 * @memberOf device
			 * @method rezize
			 * @param {function} callback
			 * @return {Object}
			 */
			resize(callback) {
				const key = `${name}-r`
				localList.push(key)
				addWindowResizeEvent(callback, key)

				return this
			},

			/**
			 * @memberOf device
			 * @method cancel
			 * @return {Object}
			 */
			cancel() {
				const key = `${name}-r`
				localList = localList.filter(item => item !== key)

				delete handles[key]

				return this
			},

			/**
			 * @memberOf device
			 * @method at
			 * @param {string} query
			 * @param {object} actions
			 * @property {function} actions.on
			 * @property {function} actions.off
			 * @return {Object}
			 */
			at(query, { on, off }) {
				const key = `${name}-${query}`
				if (!localList.includes(key)) {
					localList.push(key)
				}

				mql = window.matchMedia(query)
				const watch = match => {
					if (match) {
						on({ width: this.width, height: this.height })
					} else {
						off({ width: this.width, height: this.height })
					}
				}
				handle = e => watch(e.matches)
				watch(mql.matches)

				mql.addListener(handle)

				return this
			},

			get width() {
				return window.innerWidth
			},

			get height() {
				return window.innerHeight
			}
		}
	}
}
