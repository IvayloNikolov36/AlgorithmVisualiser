import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../../models';
import { setTimeOutAfter } from '../../helpers/thread-sleep';
import { FlowColor, MarkedColor, NodeDefaultColor, OverFlowColor } from '../../constants/graph-constants';
import {
    findNode,
    getCytoscapeOptions,
    getElements,
    getStyles,
    markEdge,
    markNode,
    setEdgeData,
    unmarkAllNodes
} from '../../functions/graph-functions';
import cytoscape from 'cytoscape';
import { Button, Form, Modal } from 'react-bootstrap';


const StartNodeName = '0';
const EndNodeName = '9';
const SpacingFactor = 0.75;

export function MaxFlow() {

    const [maxFlow, setMaxFlow] = useState(null);
    const [pathMaxFlow, setPathMaxFlow] = useState(null);
    const [isDeleteNodesActive, setIsDeleteNodesActive] = useState(false);
    const nodes = useRef([]);
    const edges = useRef([]);
    const cy = useRef(null);
    const canDeleteNodes = useRef(false);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        initialize();
    }, [])

    const initialize = () => {
        nodes.current = getInitialNodes();
        edges.current = getInitialEdges();
        initializeCytoscape(nodes.current, edges.current);
    }

    const startAlgorithm = async () => {
        setMaxFlow('calculating');
        const maxFlowValue = await findMaxFlow();
        setMaxFlow(maxFlowValue);
    }

    const findMaxFlow = async () => {
        let maxFlow = 0;
        const [startNode, endNode] = ['0', '9'];
        let parent = [];

        while (bfs(startNode, endNode, parent)) {

            let pathFlow = Number.MAX_VALUE;
            let currentNodeName = endNode;

            const pathNodes = [endNode];
            let pathEdges = [];

            while (currentNodeName !== startNode) {
                const previousNodeName = parent[currentNodeName];
                const edge = getEdge(previousNodeName, currentNodeName, edges.current);

                pathNodes.unshift(previousNodeName);
                pathEdges.unshift(edge.name);

                const edgeLeftCapacity = edge.capacity - edge.flow;

                if (edgeLeftCapacity < pathFlow) {
                    pathFlow = edgeLeftCapacity;
                }

                currentNodeName = previousNodeName;
            }

            maxFlow += pathFlow;

            pathNodes.forEach(node => markNode(cy.current, node, MarkedColor));
            pathEdges.forEach(edge => markEdge(cy.current, edge, MarkedColor));
            setPathMaxFlow(pathFlow);
            await setTimeOutAfter(2);

            currentNodeName = endNode;

            for (let edgeName of pathEdges) {

                const edge = edges.current.find(e => e.name === edgeName);
                edge.flow += pathFlow;

                const edgeWeight = `${edge.flow}/${edge.capacity}`;
                setEdgeData(cy.current, edge.name, 'weight', edgeWeight);

                const isEdgeMaxFlowReached = edge.flow === edge.capacity;
                if (isEdgeMaxFlowReached) {
                    pathEdges = pathEdges.filter(edgeName => edgeName !== edge.name);
                }

                markNode(cy.current, edge.source.name, NodeDefaultColor);
                markEdge(cy.current, edge.name, isEdgeMaxFlowReached ? OverFlowColor : FlowColor);
                markNode(cy.current, edge.target.name, NodeDefaultColor);
                await setTimeOutAfter(2);
            }

            parent = [];

            unmarkAllNodes(cy.current);
            setPathMaxFlow(null);
            setMaxFlow(maxFlow);
            await setTimeOutAfter(2);
        }

        return maxFlow;
    }

    const bfs = (startNodeName, endNodeName, parent) => {
        const queue = [];
        const visited = [];
        queue.push(startNodeName);

        while (queue.length > 0) {
            const currentNodeName = queue.shift();
            visited[parseInt(currentNodeName)] = true;

            const nodeEdges = getEdges(currentNodeName, edges.current);

            nodeEdges.forEach(edge => {
                const childNodeName = edge.target.name === currentNodeName
                    ? edge.source.name
                    : edge.target.name;

                const hasLeftCapacity = edge.flow < edge.capacity;

                if (hasLeftCapacity && !visited[parseInt(childNodeName)]) {
                    queue.push(childNodeName);
                    parent[parseInt(childNodeName)] = currentNodeName;
                }
            });
        }

        return visited[parseInt(endNodeName)];
    }

    const getEdges = (nodeName, edges) => {
        return edges.filter(e => e.source.name.toString() === nodeName.toString()
            || e.target.name.toString() === nodeName.toString());
    }

    const getEdge = (firstNodeName, secondNodeName, edges) => {
        return edges.filter(edge =>
            (edge.source.name.toString() === firstNodeName.toString()
                && edge.target.name.toString() === secondNodeName.toString())
            || (edge.source.name.toString() === secondNodeName.toString()
                && edge.target.name.toString() === firstNodeName.toString())
        )[0];
    }

    const openModal = () => {

    }

    const closeModal = () => {

    }

    const handleSubmit = () => {

    }

    const deleteNodes = () => {
        setIsDeleteNodesActive(prev => {
            return !prev;
        });

        canDeleteNodes.current = !canDeleteNodes.current;

        if (canDeleteNodes.current) {
            cy.current.on('tap', 'node', removeNodeHandler);
        } else {
            initializeCytoscape(nodes.current, edges.current);
        }
    }

    const initializeCytoscape = (nodes, edges) => {
        const cyto = cytoscape({
            container: document.getElementById('cy'),
            elements: getElements(nodes, edges),
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

    const removeNodeHandler = function (event) {
        const nodeName = event.target.id().toString();

        if (nodeName === StartNodeName || nodeName === EndNodeName) {
            return;
        }

        nodes.current = nodes.current.filter(n => n.name !== nodeName);
        edges.current = edges.current.filter(e => e.source.name !== nodeName && e.target.name !== nodeName);

        initializeCytoscape(nodes.current, edges.current);
    }

    const getInitialNodes = () => {
        return [
            new Node('0', 10, 200),
            new Node('1', 950, 30),
            new Node('2', 700, 500),
            new Node('4', 580, 10),
            new Node('5', 460, 260),
            new Node('6', 250, 50),
            new Node('7', 1190, 360),
            new Node('8', 250, 450),
            new Node('9', 1350, 170),
            new Node('11', 800, 280)
        ];
    }

    const getInitialEdges = () => {
        const edgeNames = [
            '0-6',
            '0-8',
            '6-4',
            '6-5',
            '8-5',
            '8-2',
            '5-4',
            '5-11',
            '4-1',
            '4-11',
            '2-11',
            '2-7',
            '11-1',
            '11-7',
            '1-9',
            '1-7',
            '7-9'
        ];

        const weights = [30, 22, 17, 6, 3, 14, 5, 33, 20, 11, 9, 15, 6, 20, 25, 26, 23];

        const edges = edgeNames.map((edgeName, index) => {
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

    return (
        <>
            <div className="d-flex justify-content-start gap-5 mt-2 ms-5">
                <Button onClick={openModal} variant="outline-primary">
                    Add Edge
                </Button>
                <Button onClick={deleteNodes} active={isDeleteNodesActive} variant="outline-primary">
                    Delete Nodes
                </Button>
                <Button onClick={startAlgorithm} variant="primary">
                    Start
                </Button>
                {maxFlow !== null && <span>Max Flow: {maxFlow}</span>}
                {pathMaxFlow !== null && <span>Path Max Flow: {pathMaxFlow}</span>}
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

            <div id="cy" className="d-flex w-100">
            </div>
        </>
    );
}