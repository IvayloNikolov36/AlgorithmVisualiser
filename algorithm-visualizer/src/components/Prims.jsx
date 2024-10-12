import cytoscape from 'cytoscape';
import { useEffect } from 'react';

const NodesGroup = 'nodes';
const EdgesGroup = 'edges';

export function Prims() {

    useEffect(() => {

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: getElements(),
            style: getStyles(),
            layout: getOptions(),
            zoom: 1
        });

        // console.log( cy.nodes()[1].data("id")); // b
        //console.log(cy.nodes())

        cy.nodes('[id = "a"]').style('background-color', '#ffff00');
        cy.edges('[id = "ab"]')
            .style('line-color', '#ffff00')
            .style('target-arrow-color', '#ffff00');

        cy.on('tap', 'node', function (e) {
            var ele = e.target;
            if (cy.elements('node')) {
                cy.elements().difference(ele.outgoers());
                ele.addClass('highlight').outgoers().addClass('highlight');
            }
        });

        cy.on('cxttap', 'node', function (e) {
            var ele = e.target;
            ele.removeClass('highlight').outgoers().removeClass('highlight');
        });

    }, [])

    const getOptions = () => {
        return {
            name: 'breadthfirst',
            fit: true, // whether to fit the viewport to the graph
            directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
            padding: 60, // padding on fit
            circle: false, // put depths in concentric circles if true, put depths top down if false
            grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
            spacingFactor: 1.35, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
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
        return [
            { group: NodesGroup, data: { id: 'a' } },
            { group: NodesGroup, data: { id: 'b' } },
            { group: NodesGroup, data: { id: 'c' } },
            { group: NodesGroup, data: { id: 'd' } },
            { group: NodesGroup, data: { id: 'e' } },
            { group: NodesGroup, data: { id: 'f' } },
            { group: EdgesGroup, data: { id: 'ab', source: 'a', target: 'b' } },
            { group: EdgesGroup, data: { id: 'ac', source: 'a', target: 'c' } },
            { group: EdgesGroup, data: { id: 'ad', source: 'a', target: 'd' } },
            { group: EdgesGroup, data: { id: 'bd', source: 'b', target: 'd' } },
            { group: EdgesGroup, data: { id: 'cd', source: 'c', target: 'd' } },
            { group: EdgesGroup, data: { id: 'ce', source: 'c', target: 'e' } },
            { group: EdgesGroup, data: { id: 'ed', source: 'e', target: 'd' } },
            { group: EdgesGroup, data: { id: 'ef', source: 'e', target: 'f' } },
        ]
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
                    'target-arrow-color': '#ccc',
                    // 'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
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
        <div id="cy" className="d-flex w-100">
        </div>
    );
}