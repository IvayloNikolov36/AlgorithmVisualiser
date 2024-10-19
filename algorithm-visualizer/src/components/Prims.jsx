import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../models';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import  { EdgesGroup, MarkedColor, NodesGroup, WaitInSeconds } from '../constants/graph-constants';
import PriorityQueue from 'js-priority-queue/priority-queue';
import cytoscape from 'cytoscape';
import { Button, Form, Modal } from 'react-bootstrap';

export function Prims() {

    const [showModal, setShowModal] = useState(false);
    const cy = useRef(null);

    const nodes = useRef([
        new Node('a', 150, 10),
        new Node('b', 0, 400),
        new Node('c', 500, 10),
        new Node('d', 650, 400),
        new Node('e', 900, 110),
        new Node('f', 1200, 250)
    ]);

    const edges = useRef([
        new Edge('ab', nodes.current[0], nodes.current[1], 4),
        new Edge('ac', nodes.current[0], nodes.current[2], 5),
        new Edge('ad', nodes.current[0], nodes.current[3], 9),
        new Edge('bd', nodes.current[1], nodes.current[3], 2),
        new Edge('cd', nodes.current[2], nodes.current[3], 20),
        new Edge('ce', nodes.current[2], nodes.current[4], 7),
        new Edge('ed', nodes.current[4], nodes.current[3], 8),
        new Edge('ef', nodes.current[4], nodes.current[5], 12)
    ]);

    useEffect(() => {
        initializeCytoscape();
    }, [])

    const startPrimsAlgorithm = async () => {

        const spanningTreeEdges = [];
        const markedNodes = [];
        const comparator = function (a, b) { return a.weight - b.weight };
        let priorityQueue = new PriorityQueue({ comparator });

        let currentNode = nodes.current[0];
        markNode(currentNode);
        markedNodes.push(currentNode);
        let nodeEdges = getNodeEdges(currentNode);
        enqueueElements(priorityQueue, nodeEdges);

        while (priorityQueue.length > 0) {
            const selectedEdge = priorityQueue.dequeue();

            // to avoid cycles
            if (markedNodes.some(node => node.name === selectedEdge.source.name)
                    && markedNodes.some(node => node.name === selectedEdge.target.name)) {
                continue;
            }

            await setTimeOutAfter(WaitInSeconds);
            spanningTreeEdges.push(selectedEdge);
            markEdge(selectedEdge);
            await setTimeOutAfter(WaitInSeconds);

            currentNode = markedNodes.includes(selectedEdge.source) ? selectedEdge.target : selectedEdge.source;
            markNode(currentNode);
            markedNodes.push(currentNode);
            nodeEdges = getNodeEdges(currentNode)
                .filter(edge => !spanningTreeEdges.includes(edge))
                .filter(edge => !priorityQueue.priv.data.includes(edge));

            enqueueElements(priorityQueue, nodeEdges);
        }
    }

    const markNode = (node) => {
        cy.current.nodes(`[id = '${node.name}']`).style('background-color', MarkedColor);
    }

    const markEdge = (edge) => {
        cy.current.edges(`[id = '${edge.name}']`).style('line-color', MarkedColor);
    }

    const getNodeEdges = (node) => {
        return edges.current.filter(edge => edge.source === node || edge.target === node);
    }

    const enqueueElements = (queue, elements) => {
        elements.forEach(el => queue.queue(el));
    }

    const initializeCytoscape = () => {
        const cyto = cytoscape({
            container: document.getElementById('cy'),
            elements: getElements(),
            style: getStyles(),
            layout: getOptions(),
            zoom: 1
        });

        cyto.on('free', 'node', (e) => {
            let item = e.target;

            const nodeData = item._private;
            const nodeName = nodeData.data.id;
            const x = nodeData.position.x;
            const y = nodeData.position.y;
            const index = nodes.current
                .indexOf(nodes.current.filter(node => node.name === nodeName)[0]);
            nodes.current[index] = new Node(nodeName, x, y);

            initializeCytoscape();
        });

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

    return (
        <>
            <div className="d-flex justify-content-center gap-5 mt-2">
                <Button onClick={startPrimsAlgorithm} variant="primary">
                    Find Min Spanning Tree
                </Button>
                <Button onClick={openModal} variant="outline-primary">
                    Add Edge
                </Button>
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

            <div id="cy" className="d-flex w-100">
            </div>
        </>
    );
}