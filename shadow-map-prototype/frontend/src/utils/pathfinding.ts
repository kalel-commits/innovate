export interface Point {
    lat: number;
    lng: number;
}

export interface Node {
    id: string;
    point: Point;
    neighbors: string[];
}

export const calculateDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
};

export const findShortestPath = (
    startNodeId: string,
    endNodeId: string,
    nodes: Record<string, Node>,
    blockedEdges: Set<string>
): string[] | null => {
    const openSet = new Set([startNodeId]);
    const cameFrom: Record<string, string> = {};

    const gScore: Record<string, number> = {};
    gScore[startNodeId] = 0;

    const fScore: Record<string, number> = {};
    fScore[startNodeId] = calculateDistance(nodes[startNodeId].point, nodes[endNodeId].point);

    while (openSet.size > 0) {
        let current = Array.from(openSet).reduce((minNode, node) =>
            (fScore[node] < fScore[minNode] ? node : minNode)
            , Array.from(openSet)[0]);

        if (current === endNodeId) {
            const path = [current];
            while (cameFrom[current]) {
                current = cameFrom[current];
                path.unshift(current);
            }
            return path;
        }

        openSet.delete(current);

        for (const neighborId of nodes[current].neighbors) {
            if (blockedEdges.has(`${current}-${neighborId}`) || blockedEdges.has(`${neighborId}-${current}`)) continue;

            const tentativeGScore = gScore[current] + calculateDistance(nodes[current].point, nodes[neighborId].point);

            if (tentativeGScore < (gScore[neighborId] ?? Infinity)) {
                cameFrom[neighborId] = current;
                gScore[neighborId] = tentativeGScore;
                fScore[neighborId] = gScore[neighborId] + calculateDistance(nodes[neighborId].point, nodes[endNodeId].point);
                openSet.add(neighborId);
            }
        }
    }

    return null;
};
