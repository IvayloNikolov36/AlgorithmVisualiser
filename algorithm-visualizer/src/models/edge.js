export class Edge {
    constructor (name, source, target, weight) {
        this.name = name;
        this.source = source;
        this.target = target;
        this.weight = weight;
        this.flow = 0;
        this.capacity = weight; // TODO: create another class
    }
}