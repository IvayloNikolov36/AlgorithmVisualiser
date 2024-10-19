import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../models';
import { EdgesGroup, MarkedColor, NodesGroup } from '../constants/graph-constants';
import cytoscape from 'cytoscape';
import { Button, ButtonGroup, Form, Modal, Table } from 'react-bootstrap';
import { maxBy } from 'lodash';
import PriorityQueue from 'js-priority-queue/priority-queue';


const StartNodeName = '0';
const EndNodeName = '9';

export function Dijkstras() {

    const [distancesArr, setDistancesArr] = useState([]);
    const [prevsArr, setPrevsArr] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isDeleteNodesActive, setIsDeleteNodesActive] = useState(false);
    const canDeleteNodes = useRef(false);
    const cy = useRef(null);
    const nodes = useRef([]);
    const edges = useRef([]);

    useEffect(() => {
        nodes.current = [
            new Node(StartNodeName, 10, 210),
            new Node('1', 950, 50),
            new Node('2', 550, 450),
            new Node('3', 720, 200),
            new Node('4', 500, 50),
            new Node('5', 420, 270),
            new Node('6', 220, 100),
            new Node('7', 980, 400),
            new Node('8', 200, 410),
            new Node(EndNodeName, 1200, 245),
        ];

        edges.current = [
            new Edge('0-6', findNode('0'), findNode('6'), 10),
            new Edge('0-8', findNode('0'), findNode('8'), 12),
            new Edge('6-4', findNode('6'), findNode('4'), 17),
            new Edge('6-5', findNode('6'), findNode('5'), 6),
            new Edge('4-1', findNode('4'), findNode('1'), 20),
            new Edge('4-3', findNode('4'), findNode('3'), 11),
            new Edge('5-4', findNode('5'), findNode('4'), 5),
            new Edge('5-3', findNode('5'), findNode('3'), 33),
            new Edge('8-5', findNode('8'), findNode('5'), 3),
            new Edge('8-2', findNode('8'), findNode('2'), 14),
            new Edge('2-3', findNode('2'), findNode('3'), 9),
            new Edge('2-7', findNode('2'), findNode('7'), 15),
            new Edge('3-1', findNode('3'), findNode('1'), 6),
            new Edge('3-7', findNode('3'), findNode('7'), 20),
            new Edge('1-9', findNode('1'), findNode('9'), 5),
            new Edge('1-7', findNode('1'), findNode('7'), 26),
            new Edge('7-9', findNode('7'), findNode('9'), 3),
        ];

        initializeCytoscape();
        const distances = initializeDistancesArray();
        const prevs = initializePrevArray();
        setDistancesArr(distances);
        setPrevsArr(prevs);
    }, [])

    const initializeDistancesArray = () => {
        const distances = [];
        const maxIndex = parseInt(maxBy(nodes.current, x => parseInt(x.name)).name);
        distances[0] = 0;
        for (let i = 1; i <= maxIndex; i++) {
            distances[i] = Number.POSITIVE_INFINITY;
        }

        return distances;
    }

    const initializePrevArray = () => {
        const prev = [];
        const maxIndex = parseInt(maxBy(nodes.current, x => parseInt(x.name)).name);
        for (let i = 0; i <= maxIndex; i++) {
            prev[i] = null;
        }
        return prev;
    }

    const startDijkstrasAlgorithm = () => {

        const distances = initializeDistancesArray();
        const prev = initializePrevArray();

        const comparator = function (firstNode, secondNode) {
            return distances[parseInt(firstNode.name)] - distances[parseInt(secondNode.name)];
        };

        let priorityQueue = new PriorityQueue({ comparator });

        priorityQueue.queue(nodes.current[0]);
        const visitedNodes = [];

        while (priorityQueue.length > 0) {
            const nodeElement = priorityQueue.dequeue();
            visitedNodes.push(nodeElement);
            const [allChildren, notVisitedChildren] = getChildren(nodeElement, visitedNodes);

            notVisitedChildren.forEach(node => priorityQueue.queue(node));

            allChildren.forEach(childNode => {

                const index = parseInt(childNode.name);

                const distanceToParent = getDistanceBetweenNodes(nodeElement, childNode);
                const indexOfParent = parseInt(nodeElement.name);
                const parentToStartDistance = distances[indexOfParent];
                const distance = distanceToParent + parentToStartDistance;

                if (distance < distances[index]) {
                    distances[index] = distance;
                    prev[index] = parseInt(nodeElement.name);
                }
            });
        }

        console.log(distances);
        console.log(prev);

        setDistancesArr(distances);
        setPrevsArr(prev);

        markTheShortestPath(prev, parseInt(EndNodeName), parseInt(StartNodeName));
    }

    const markTheShortestPath = (prevArray, lastNode, firstNode) => {

        let currentNode = lastNode;
        markNode(currentNode);

        let previousNode = prevArray[currentNode];
        markEdge(findEdge(currentNode, previousNode));
        markNode(previousNode);

        while (previousNode !== firstNode) {
            currentNode = previousNode;
            previousNode = prevArray[currentNode];
            markNode(previousNode);
            markEdge(findEdge(currentNode, previousNode));
        }
    }

    const clearPath = () => {
        initializeCytoscape();
        const distances = initializeDistancesArray();
        const prevs = initializePrevArray();
        setDistancesArr(distances);
        setPrevsArr(prevs);
    }

    const openModal = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const sourceNodeName = e.target[1].value;
        let sourceNode = findNode(sourceNodeName);

        if (!sourceNode) {
            sourceNode = new Node(sourceNodeName, 1200, 500);
            nodes.current.push(sourceNode);
        }

        const targetNodeName = e.target[2].value;
        let targetNode = findNode(targetNodeName);

        if (!targetNode) {
            targetNode = new Node(targetNodeName, 1200, 500);
            nodes.current.push(targetNode);
        }

        const edgeName = e.target[0].value;
        const weight = parseInt(e.target[3].value);
        const newEdge = new Edge(edgeName, sourceNode, targetNode, weight);
        edges.current.push(newEdge);

        initializeCytoscape();

        closeModal();
    }

    const findNode = (name) => {
        return nodes.current.filter(node => node.name === name)[0];
    }

    const findEdge = (firstNode, secondNode) => {
        const filteredEdges = edges.current.filter(edge =>
            (parseInt(edge.source.name) === firstNode && parseInt(edge.target.name) === secondNode)
            || (parseInt(edge.target.name) === firstNode && parseInt(edge.source.name) === secondNode));

        return filteredEdges[0];
    }

    const markNode = (nodeName) => {
        cy.current.nodes(`[id = '${nodeName}']`).style('background-color', MarkedColor);
    }

    const markEdge = (edge) => {
        cy.current.edges(`[id = '${edge.name}']`).style('line-color', MarkedColor);
    }

    const getDistanceBetweenNodes = (firstNode, secondNode) => {
        const filteredEdges = edges.current.filter(edge =>
            (edge.target.name === firstNode.name && edge.source.name === secondNode.name)
            || (edge.source.name === firstNode.name && edge.target.name === secondNode.name));

        return filteredEdges[0].weight;
    }

    const getChildren = (parentNode, visited) => {
        const nodeEdges = edges.current.filter(edge => edge.source === parentNode || edge.target === parentNode);

        const children = nodeEdges.map(edge => {
            const otherNode = edge.source === parentNode ? edge.target : edge.source;
            return otherNode;
        });

        const containsNode = (node) => visited.some(visitedNode => visitedNode.name === node.name);
        const notVisitedChildren = children.filter(node => !containsNode(node));

        return [children, notVisitedChildren];
    }

    const deleteNodes = () => {
        setIsDeleteNodesActive(prev => {
            return !prev;
        });

        canDeleteNodes.current = !canDeleteNodes.current;

        if (canDeleteNodes.current) {
            cy.current.on('tap', 'node', removeNodeHandler);
        } else {
            initializeCytoscape();
        }
    }

    const removeNodeHandler = function (e) {
        const nodeName = e.target.id().toString();

        if (nodeName === StartNodeName || nodeName === EndNodeName) {
            return;
        }

        nodes.current = nodes.current.filter(n => n.name !== nodeName);
        edges.current = edges.current.filter(e => e.source.name !== nodeName && e.target.name !== nodeName);

        initializeCytoscape();
    }

    const initializeCytoscape = () => {
        const cyto = cytoscape({
            container: document.getElementById('cy-dijkstra'),
            elements: getElements(),
            style: getStyles(),
            layout: getOptions(),
            zoom: 1
        });

        if (canDeleteNodes.current) {
            cyto.on('tap', 'node', removeNodeHandler);
        }

        cyto.userZoomingEnabled(false);

        cy.current = cyto;
    }

    const getOptions = () => {
        return {
            name: 'preset',
            fit: true, // whether to fit the viewport to the graph
            directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
            padding: 60, // padding on fit
            circle: false, // put depths in concentric circles if true, put depths top down if false
            grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
            spacingFactor: 0.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
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

    const getElements = () => {

        const nodesElements = nodes.current.map(node => {
            return {
                group: NodesGroup,
                data: { id: node.name },
                position: { x: node.positionX, y: node.positionY }
            }
        });

        const edgesElements = edges.current.map(edge => {
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

    const getStyles = () => {
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

    return (
        <>
            <div className="d-flex justify-content-around mt-1">
                <div>
                    <Table responsive>
                        <tbody>
                            <tr>
                                <td>v</td>
                                {nodes.current.map((node, index) => (
                                    <td key={index}>
                                        {node.name}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>distance[v]</td>
                                {nodes.current.map((node, index) => (
                                    <td key={index}>
                                        {(distancesArr[parseInt(node.name)] === Number.POSITIVE_INFINITY)
                                            ? <span>&#8734;</span>
                                            : <span>{distancesArr[parseInt(node.name)]}</span>
                                        }
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>previous[v]</td>
                                {nodes.current.map((node, index) => (
                                    <td key={index}>{prevsArr[parseInt(node.name)] ?? '-'}</td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>
                <div>
                    <ButtonGroup>
                        <Button onClick={startDijkstrasAlgorithm} variant="primary">
                            Find Shortest Path
                        </Button>
                        <Button onClick={clearPath} variant="outline-primary">
                            Clear Path
                        </Button>
                        <Button onClick={openModal} variant="outline-primary">
                            Add Edge
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup className="ms-2">
                        <Button onClick={deleteNodes} active={isDeleteNodesActive} variant="outline-primary">
                            Delete Nodes
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            <div id="cy-dijkstra" className="d-flex w-100">
            </div>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Edge</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="new-edge" onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formGroupEmail">
                            <Form.Label>Edge Name</Form.Label>
                            <Form.Control placeholder="Enter edge name" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupEmail">
                            <Form.Label>Source</Form.Label>
                            <Form.Control placeholder="Enter source" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupEmail">
                            <Form.Label>Target</Form.Label>
                            <Form.Control placeholder="Enter target" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupEmail">
                            <Form.Label>Weight</Form.Label>
                            <Form.Control placeholder="Enter weight" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit" form="new-edge">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}