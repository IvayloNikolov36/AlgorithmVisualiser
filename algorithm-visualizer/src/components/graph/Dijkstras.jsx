import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../../models';
import { MarkedColor } from '../../constants/graph-constants';
import {
    addEdge,
    getCytoscapeOptions,
    getElements,
    getStyles,
    findEdge,
    findNode,
    markEdge,
    markNode
} from '../../functions/graph-functions';
import cytoscape from 'cytoscape';
import { Button, ButtonGroup, Form, Modal, Table } from 'react-bootstrap';
import { maxBy } from 'lodash';
import PriorityQueue from 'js-priority-queue/priority-queue';


const StartNodeName = '0';
const EndNodeName = '9';
const SpacingFactor = 0.75;

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
        nodes.current = getInitialNodes();
        edges.current = getInitialEdges();
        initializeCytoscape();
        const distances = initializeDistancesArray();
        const prevs = initializePrevArray();
        setDistancesArr(distances);
        setPrevsArr(prevs);
    }, [])

    const getInitialNodes = () => {
        return [
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
    }

    const getInitialEdges = () => {
        const edgesNames = ['0-6', '0-8', '6-4', '6-5', '4-1', '4-3', '5-4', '5-3', '8-5', '8-2', '2-3', '2-7', '3-1', '3-7', '1-9', '1-7', '7-9'];
        
        const weights = [10, 12, 17, 6, 20, 11, 5, 33, 3, 14, 9, 15, 6, 20, 5, 26, 3];

        const edges = edgesNames.map((edgeName, index) => {
            const tokens = edgeName.split('-');
            const firstNode = tokens[0];
            const secondNode = tokens[1];
            return new Edge(
                edgeName,
                findNode(firstNode, nodes.current),
                findNode(secondNode, nodes.current),
                weights[index]);
        });

        return edges;
    }

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
        markNode(cy.current, currentNode, MarkedColor);

        let previousNode = prevArray[currentNode];
        markEdge(cy.current, findEdge(currentNode, previousNode, edges.current).name, MarkedColor);
        markNode(cy.current, previousNode, MarkedColor);

        while (previousNode !== firstNode) {
            currentNode = previousNode;
            previousNode = prevArray[currentNode];
            markNode(cy.current, previousNode, MarkedColor);
            markEdge(cy.current, findEdge(currentNode, previousNode, edges.current).name, MarkedColor);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        addEdge(event.target, nodes.current, edges.current);
        initializeCytoscape();
        closeModal();
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

    const removeNodeHandler = function (event) {
        const nodeName = event.target.id().toString();

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
            elements: getElements(nodes.current, edges.current),
            style: getStyles(),
            layout: getCytoscapeOptions(SpacingFactor),
            zoom: 1
        });

        if (canDeleteNodes.current) {
            cyto.on('tap', 'node', removeNodeHandler);
        }

        cyto.userZoomingEnabled(false);

        cy.current = cyto;
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
                            <Form.Control placeholder="Enter weight" type="number" min={'0'} />
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