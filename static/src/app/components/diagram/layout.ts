import dagre from "dagre";

export const getLayoutedElements = (nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 120 });

    nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 260, height: 160 }));
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const { x, y } = dagreGraph.node(node.id);
        return { ...node, position: { x, y } };
    });

    return { nodes: layoutedNodes, edges };
};
