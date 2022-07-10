
// Manual Graph Postion Scaling
var scale = 150

function colorizer(el, type){
    if (el == "node"){
        switch (type) {
            case 0:
                return {color: 'red', opacity: 1}
            case 1:
                return {color: 'darkred', opacity: 0.5}
            default:
                return {color: 'black', opacity: 1}
        }
    }else if (el == "edge"){
        switch (type) {
            case 0:
                return 'grey'
            default:
                return 'black'
        }
    }
    return 'green'
}

var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [{
        selector: 'node',
        style: {
            shape: 'hexagon',
            'background-color': 'data(color)',
            'background-opacity': 'data(opacity)',
            label: 'data(label)'
        }
    },{
        selector: 'edge',
        style: {
            label: 'data(label)',
            "text-background-opacity": 1,
            "text-background-color": "#888",
            "text-background-shape": "roundrectangle",
            "text-background-padding": "5px"
        }
    },
    {
        selector: 'edge.nextNearest',
        style: {
            "curve-style": "unbundled-bezier",
            "control-point-distances": 120,
            "control-point-weights": 0.5
        }
    }],
    elements: [],
    layout: {
        name: 'grid'
    },
    autoungrabify: true
});

var currentNode;
var currentEdge;

cy.on('tap', 'node', function (evt) {
    var n = cy.$('#' + evt.target.id());
    //console.log(n.data());
    currentNode = n;
    
    const { elements } = document.querySelector('#addNode')

    for (const [ key, value ] of Object.entries(n.data()) ) {
        const field = elements.namedItem(key)
        field && (field.value = value)
    }

});

cy.on('tap', 'edge', function (evt) {
    //console.log("Edge: " + evt.target.id())

    // fill form with clicked edge data
    var e = cy.$('#' + evt.target.id());

    currentEdge = e;

    const { elements } = document.querySelector('#addEdge')

    var data = e.data()

    elements.namedItem("name-src") && (elements.namedItem("name-src").value = cy.$('#' + data.source).id().substring(1))
    elements.namedItem("x-src") && (elements.namedItem("x-src").value = cy.$('#' + data.source).data('x'))
    elements.namedItem("y-src") && (elements.namedItem("y-src").value = cy.$('#' + data.source).data('y'))
    elements.namedItem("name-dst") && (elements.namedItem("name-dst").value = cy.$('#' + data.target).id().split("-")[0].substring(1))
    elements.namedItem("x-dst") && (elements.namedItem("x-dst").value = cy.$('#' + data.target).data('x'))
    elements.namedItem("y-dst") && (elements.namedItem("y-dst").value = cy.$('#' + data.target).data('y'))
    elements.namedItem("i-type") && (elements.namedItem("i-type").value = data.type)
    elements.namedItem("sub-val") && (elements.namedItem("sub-val").value = data.sub)

});

function handleSubmit(event) {

    event.preventDefault();

    const data = new FormData(event.target);
    
    const value = Object.fromEntries(data.entries());

    console.log(value);

    if (event.target.getAttribute('id') == "addNode"){addNode(value, 0)}
    else if (event.target.getAttribute('id') == "addEdge"){addEdge(value)}

  }


  document.getElementById("addNode").addEventListener('submit', handleSubmit);
  document.getElementById("addEdge").addEventListener('submit', handleSubmit);

function addNode(data, type) {

    // if type == 1 then we can base it off a template, but we need to make sure that template exists...

    var pos = {x : data.x * scale, y: data.y * -scale}

    var n = getNode(pos)

    if (n != null){
        console.log("Removing Old Node...");
        cy.remove(n);
    }

    console.log(data)

    cy.add({
        data: Object.assign({ "id": "S" + data.name , "position": pos, name: data.name, x: pos.x / scale, y: pos.y / scale * -1, "p-inc": data["p-inc"], "p-val": data["p-val"], "t-inc": data["t-inc"], "t-val": data["t-val"], type: type, label: ("S" + data.name).split("-")[0]}, colorizer('node', type)),
        position: pos
    });

    n = cy.$('#S' + data.name);
    cy.center( n );
    return n
}


function addEdge(data) {

    console.log(data);

    var srcPos = {x : data["x-src"] * scale, y: data["y-src"] * -scale}
    var dstPos = {x : data["x-dst"] * scale, y: data["y-dst"]  * -scale}

    var dstID = data["name-dst"]

    //check node at source
    var m = getNode(srcPos)
    if (m.data('type') == 1){
        console.log("Error: Cannot Create Edge From Temporary Node");
        return
    }

    //check for node at destination
    var n = getNode(dstPos)

    if (n == null) { // no node exists, lets create a temp one with the template node given
        console.log("Creating 'Invisible' Node From Template...");
        dstID = data["name-dst"] + "-o-" + (Math.random() + 1).toString(36).substring(7) 
        n = addNode({name: dstID, x: dstPos.x / scale, y: dstPos.y / scale * -1}, 1) // will create "invisible" node outside for edge
        dstID = "S" + dstID
    }else{ // node does exist
        if (n.data('type') != 1){ // check if it is a temp node
            if (n.id().split('-')[0] == "S" + data["name-dst"]){ // permenant node exists on the other side with the same type
                dstID = n.id()
            }else{ // permenant node exists but wrong type, we cannot create this edge
                console.log("Error: Node Mismatch, Check Types...");
                n = null
            }
        }else{
            dstID = n.id()
        }
    }

    if (n != null){ // make sure that there were no errors when finding the destination

        var e = getEdge(srcPos, dstPos) // get current edge

        if (e != null){ // remove old edge if it exists
            console.log("Removing Old Edge...");
            cy.remove(e);
        }

        var eId = "S" + data["name-src"] + "-" + dstID

        var edgeName = genEdgeName(cy, data["name-src"], dstID.split("-")[0].substring(1))

        //Add Edge
        cy.add({
            data: {
                id: eId, source: "S" + data["name-src"], target: dstID, sub: data["sub-val"], type: data["i-type"], name: edgeName, label: (data["sub-val"] != "" ? data["sub-val"]: edgeName)
            },
            classes: "" + (data["i-type"] == 1 ? "nearest" : "nextNearest")
        });
    
        e = cy.$('#' + eId);
        console.log(e.data('name'));
        cy.center( e );

    }

}

function genEdgeName(graph, srcName, dstName){
    var edgeName = "J" + srcName + dstName
    subs = graph.edges().each().map( edge => edge.data('name'));
    subMap = subs.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    var num = 0
    while(subMap.has(edgeName + num)) num++;
    edgeName = edgeName + num
    return edgeName
}


function getNode(pos){
    var n = null;
    cy.nodes().each(function(node) {
        if (node.position('y') == pos.y && node.position('x') == pos.x) n = node
    })
    return n
}

function getEdge(srcPos, dstPos){
    var e = null
    cy.edges().each(function(edge) {
        if (edge.source().position('x') == srcPos.x && edge.source().position('y') == srcPos.y && edge.target().position('x') == dstPos.x && edge.target().position('y') == dstPos.y) e = edge
    });
    return e
}

function removeElement(type){
    cy.remove((type ? currentEdge : currentNode ))
}