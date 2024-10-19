import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../models';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import { MarkedColor, WaitInSeconds } from '../constants/graph-constants';
import {
    getCytoscapeOptions,
    getElements,
    getNodeEdges,
    getStyles,
    findNode,
    markEdge,
    markNode
} from '../functions/graph-functions';
import PriorityQueue from 'js-priority-queue/priority-queue';
import cytoscape from 'cytoscape';
import { Button, Form, Modal } from 'react-bootstrap';


const SpacingFactor = 0.75;

export function Prims() {

    const [showModal, setShowModal] = useState(false);
    const cy = useRef(null);
    const nodes = useRef([]);
    const edges = useRef([]);

    useEffect(() => {
        nodes.current = getInitialNodes();
        edges.current = getInitialEdges();
        initializeCytoscape();
    }, [])

    const startPrimsAlgorithm = async () => {

        const spanningTreeEdges = [];
        const markedNodes = [];
        const comparator = function (a, b) { return a.weight - b.weight };
        let priorityQueue = new PriorityQueue({ comparator });

        let currentNode = nodes.current[0];
        markNode(cy.current, currentNode.name, MarkedColor);
        markedNodes.push(currentNode);
        let nodeEdges = getNodeEdges(edges.current, currentNode);
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
            markEdge(cy.current, selectedEdge.name, MarkedColor);
            await setTimeOutAfter(WaitInSeconds);

            currentNode = markedNodes.includes(selectedEdge.source) ? selectedEdge.target : selectedEdge.source;
            markNode(cy.current, currentNode.name, MarkedColor);
            markedNodes.push(currentNode);
            nodeEdges = getNodeEdges(edges.current, currentNode)
                .filter(edge => !spanningTreeEdges.includes(edge))
                .filter(edge => !priorityQueue.priv.data.includes(edge));

            enqueueElements(priorityQueue, nodeEdges);
        }
    }

    const enqueueElements = (queue, elements) => {
        elements.forEach(el => queue.queue(el));
    }

    const initializeCytoscape = () => {
        const cyto = cytoscape({
            container: document.getElementById('cy'),
            elements: getElements(nodes.current, edges.current),
            style: getStyles(),
            layout: getCytoscapeOptions(SpacingFactor),
            zoom: 1
        });

        cy.current = cyto;
    }

    const getInitialNodes = () => {
        return [
            new Node('a', 150, 10),
            new Node('b', 0, 400),
            new Node('c', 500, 10),
            new Node('d', 650, 400),
            new Node('e', 900, 110),
            new Node('f', 1200, 250)
        ];
    }

    const getInitialEdges = () => {
        const edgeNames = ['ab', 'ac', 'ad', 'bd', 'cd', 'ce', 'ed', 'ef'];
        const weights = [4, 5, 9, 2, 20, 7, 8, 12];

        const edges = edgeNames.map((edgeName, index) => {
            return new Edge(
                edgeName,
                findNode(edgeName[0], nodes.current),
                findNode(edgeName[1], nodes.current),
                weights[index]);
        });

        return edges;
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
        let sourceNode = findNode(sourceNodeName, nodes.current);

        if (!sourceNode) {
            sourceNode = new Node(sourceNodeName, 1200, 500);
            nodes.current.push(sourceNode);
        }

        const targetNodeName = e.target[2].value;
        let targetNode = findNode(targetNodeName, nodes.current);

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