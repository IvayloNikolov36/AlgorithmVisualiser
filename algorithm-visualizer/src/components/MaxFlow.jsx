import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../models';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import {
    EdgeDefaultColor,
    FindMinSpanForest,
    FindMinSpanTree,
    MarkedColor,
    NodeDefaultColor,
    WaitInSeconds
} from '../constants/graph-constants';
import {
    addEdge,
    findNode,
    getCytoscapeOptions,
    getElements,
    getNodeEdges,
    getStyles,
    markEdge,
    markNode
} from '../functions/graph-functions';
import cytoscape from 'cytoscape';
import { Button, Form, Modal } from 'react-bootstrap';


const SpacingFactor = 0.75;

export function MaxFlow() {

    const nodes = useRef([]);
    const edges = useRef([]);
    const cy = useRef(null);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        initialize();
    }, [])

    const initialize = () => {
        nodes.current = getInitialNodes();
        edges.current = getInitialEdges();
        initializeCytoscape();
    }

    const initializeCytoscape = () => {
        const cyto = cytoscape({
            container: document.getElementById('cy'),
            elements: getElements(nodes.current, edges.current),
            style: getStyles(),
            layout: getCytoscapeOptions(SpacingFactor),
            zoom: 1
        });

        // if (canDeleteNodes.current) {
        //     cyto.on('tap', 'node', removeNodeHandler);
        // }

        cyto.userZoomingEnabled(false);

        cy.current = cyto;
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

    const startAlgorithm = () => {

    }

    const openModal = () => {

    }

    const closeModal = () => {

    }

    const handleSubmit = () => {

    }

    const deleteNodes = () => {

    }

    return (
        <>
            <div className="d-flex justify-content-center gap-5 mt-2">
                <Button onClick={openModal} variant="outline-primary">
                    Add Edge
                </Button>
                <Button onClick={deleteNodes} variant="outline-primary">
                    Delete Nodes
                </Button>
                <Button onClick={startAlgorithm} variant="primary">
                    Start
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