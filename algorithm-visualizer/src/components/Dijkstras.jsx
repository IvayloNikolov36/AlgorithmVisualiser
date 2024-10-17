import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from '../models';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import { EdgesGroup, MarkedColor, NodesGroup, WaitInSeconds } from '../constants/graph-constants';
import cytoscape from 'cytoscape';
import { Button } from 'react-bootstrap';

export function Dijkstras() {

    const cy = useRef(null);

    const nodes = useRef([
        new Node('0', 10, 210),
        new Node('1', 950, 50),
        new Node('2', 550, 450),
        new Node('4', 500, 50),
        new Node('5', 420, 270),
        new Node('6', 220, 100),
        new Node('7', 980, 400),
        new Node('8', 200, 410),
        new Node('9', 1200, 245),
        new Node('11', 720, 200)
    ]);

    const edges = useRef([
        new Edge('0-6', nodes.current[0], nodes.current[5], 10),
        new Edge('0-8', nodes.current[0], nodes.current[7], 12),
        new Edge('6-4', nodes.current[5], nodes.current[3], 17),
        new Edge('6-5', nodes.current[5], nodes.current[4], 6),
        new Edge('4-1', nodes.current[3], nodes.current[1], 20),
        new Edge('4-11', nodes.current[3], nodes.current[9], 11),
        new Edge('5-4', nodes.current[4], nodes.current[3], 5),
        new Edge('5-11', nodes.current[4], nodes.current[9], 33),
        new Edge('8-5', nodes.current[7], nodes.current[4], 3),
        new Edge('8-2', nodes.current[7], nodes.current[2], 14),
        new Edge('2-11', nodes.current[2], nodes.current[9], 9),
        new Edge('2-7', nodes.current[2], nodes.current[6], 15),
        new Edge('11-1', nodes.current[9], nodes.current[1], 6),
        new Edge('11-7', nodes.current[9], nodes.current[6], 20),
        new Edge('1-9', nodes.current[1], nodes.current[8], 5),
        new Edge('1-7', nodes.current[1], nodes.current[6], 26),
        new Edge('7-9', nodes.current[6], nodes.current[8], 3),
    ]);

    useEffect(() => {
        initializeCytoscape();
    }, [])

    const startDijkstrasAlgorithms = () => {

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

            console.log(nodes);
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
            debugger;
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
            <div className="d-flex justify-content-center gap-5 mt-2">
                <Button onClick={startDijkstrasAlgorithms} variant="primary">
                    Find Shortest Path
                </Button>
            </div>

            <div id="cy" className="d-flex w-100">
            </div>
        </>
    );
}