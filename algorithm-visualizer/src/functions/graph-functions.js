import { EdgesGroup, NodesGroup } from '../constants/graph-constants';
import { Edge, Node } from '../models';

export function markNode(cytoscape, nodeName, color) {
    cytoscape.nodes(`[id = '${nodeName}']`).style('background-color', color);
}

export function markEdge(cytoscape, edgeName, color) {
    cytoscape.edges(`[id = '${edgeName}']`).style('line-color', color);
}

export function getNodeEdges(edges, node) {
    return edges.filter(edge => edge.source === node || edge.target === node);
}

export function findNode(nodeName, nodes) {
    return nodes.filter(node => node.name === nodeName)[0];
}

export function findEdge(firstNodeName, secondNodeName, edges) {
    const filteredEdges = edges.filter(edge =>
        (parseInt(edge.source.name) === firstNodeName
            && parseInt(edge.target.name) === secondNodeName)
        || (parseInt(edge.target.name) === firstNodeName
            && parseInt(edge.source.name) === secondNodeName));

    return filteredEdges[0];
}

export function addEdge(data, nodes, edges) {
    const sourceNodeName = data[1].value;
    let sourceNode = findNode(sourceNodeName, nodes);

    if (!sourceNode) {
        sourceNode = new Node(sourceNodeName, 100, 460);
        nodes.push(sourceNode);
    }

    const targetNodeName = data[2].value;
    let targetNode = findNode(targetNodeName, nodes);

    if (!targetNode) {
        targetNode = new Node(targetNodeName, 1200, 530);
        nodes.push(targetNode);
    }

    const edgeName = data[0].value;
    const weight = parseInt(data[3].value);
    const newEdge = new Edge(edgeName, sourceNode, targetNode, weight);
    edges.push(newEdge);
}

export function getCytoscapeOptions(spacingFactor) {
    return {
        name: 'preset',
        fit: true, // whether to fit the viewport to the graph
        directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 60, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: spacingFactor, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    };
}

export function getElements(nodes, edges) {
    const nodesElements = nodes.map(node => {
        return {
            group: NodesGroup,
            data: { id: node.name },
            position: { x: node.positionX, y: node.positionY }
        }
    });

    const edgesElements = edges.map(edge => {
        return {
            group: EdgesGroup,
            data: {
                id: edge.name,
                source: edge.source.name,
                target: edge.target.name,
                weight: edge.weight
            }
        }
    });

    return [...nodesElements, ...edgesElements]
}

export function isGraphConnected(nodes, edges) {
    const queue = [nodes[0]];
    const visitedNodes = [];

    while (queue.length > 0) {
        const currentNode = queue.shift();
        visitedNodes.push(currentNode.name);
        const children = edges
            .filter(edge => edge.source.name === currentNode.name
                || edge.target.name === currentNode.name);
        children.forEach(edge => {
            const nodeToQueue = edge.source.name === currentNode.name ? edge.target : edge.source;
            if (!queue.includes(nodeToQueue) && !visitedNodes.includes(nodeToQueue.name)) {
                queue.push(nodeToQueue);
            }
        });
    }

    return nodes.every(node => visitedNodes.includes(node.name));
}

export function getStyles() {
    return [
        {
            selector: 'node',
            style: {
                'background-color': '#0D6EFD',
                'label': 'data(id)',
                'width': 40,
                'height': 40
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 5,
                'line-color': '#ccc',
                // 'line-style': 'dashed',
                'target-arrow-color': '#ccc',
                // 'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(weight)',
                // 'source-label': 'data(source)',
                'text-margin-x': 5,
                'text-margin-y': 20
            }
        },
        {
            selector: 'node[background_color]',
            style: {
                'background-color': 'data(background_color)',
                'text-outline-color': 'data(background_color)',
            }
        },
        {
            selector: 'edge[line-color]',
            style: {
                'line-color': 'data(line-color)',
            }
        },
        {
            selector: 'edge[target-arrow-color]',
            style: {
                'target-arrow-color': 'data(target-arrow-color)',
            }
        },
        {
            selector: 'node.highlight',
            style: {
                'label': 'data(name)',
                'text-valign': 'center',
                'color': "white",
                'text-outline-color': 'red',
                'text-outline-width': 2,
                'background-color': 'red'
            }
        },
        {
            selector: 'node.semitransp',
            style: { 'opacity': '0.5' }
        },

    ];
}