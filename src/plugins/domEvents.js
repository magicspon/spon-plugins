import sponDomEvents from '@spon/domevents'
/**
 * @module plugin/withDomEvents
 */

/**
 * @function domEvents
 * @property {object} props
 * @property {HTMLElement} props.node the root node to attach events to
 * @property {function} props.register a function used to store the destroy method
 * @return {object}
 */
export default function domEvents({ node, register }) {
	const events = sponDomEvents(node)
	register(events.removeEvents)
	return events
}
