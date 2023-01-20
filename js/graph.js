/**
 * 
 * 
 *  Init
 * 
 * 
 * 
 */

var container = document.getElementById('networkBox');

var options = {
    autoResize: true,
    width: '100%',
    height: '100%',
    nodes: {
        shape: 'circle',
        font: '25px arial black'
    },
    edges: {
      smooth: false,
      shadow: true,
      font: {
        color: 'black',
        size: 20, // px
        face: 'arial',
        background: 'white'
      },
    },
    physics: false,
    interaction: {
      dragNodes: false,// do not allow dragging nodes
      zoomView: true, // do not allow zooming
      dragView: true  // do not allow dragging
    }
  };

// create an array with nodes
var nodes = new vis.DataSet([]);

// create an array with edges
var edges = new vis.DataSet([]);

var data = {
    nodes: nodes,
    edges: edges
};

// create a network
var network = new vis.Network(container, data, options);

// Set the coordinate system of Network such that it exactly
// matches the actual pixels of the HTML canvas on screen
// this must correspond with the width and height set for
// the networks container element.

/*network.moveTo({
    position: {x: 0, y: 0},
    offset: {x: -window.innerWidth/2, y: -window.innerHeight/2},
    scale: 1,
})*/

network.redraw();

network.on( 'click', function(properties) {

    if (properties.nodes.length == 1){ // node clicked


        var node = nodes.get(properties.nodes[0]);
        console.log(node);

        const { elements } = document.querySelector('#addNode')

        elements.namedItem("x") && (elements.namedItem("x").value = (node["x"] / 250))
        elements.namedItem("y") && (elements.namedItem("y").value = (node["y"] / -250))
        elements.namedItem("name") && (elements.namedItem("name").value = node["label"].replace('S', ''))
        elements.namedItem("t-val") && (elements.namedItem("t-val").value = node["theta"])
        elements.namedItem("t-inc") && (elements.namedItem("t-inc").value = node["thetaInc"])
        elements.namedItem("p-val") && (elements.namedItem("p-val").value = node["phi"])
        elements.namedItem("p-inc") && (elements.namedItem("p-inc").value = node["phiInc"])

        document.getElementById("siteTabPill").click()



    }else if(properties.edges.length == 1 && properties.nodes.length == 0){

        var edge = edges.get(properties.edges[0])

        var from = nodes.get(edge.from)
        var to = nodes.get(edge.to)

        const { elements } = document.querySelector('#addEdge')

        console.log(edge);

        elements.namedItem("name-src") && (elements.namedItem("name-src").value = from["label"].replace('S', ''))
        elements.namedItem("x-src") && (elements.namedItem("x-src").value = (from["x"] / 250))
        elements.namedItem("y-src") && (elements.namedItem("y-src").value = (from["y"] / -250))
        elements.namedItem("name-dst") && (elements.namedItem("name-dst").value = to["label"].replace('S', ''))
        elements.namedItem("x-dst") && (elements.namedItem("x-dst").value = (to["x"] / 250))
        elements.namedItem("y-dst") && (elements.namedItem("y-dst").value = (to["y"] / -250))
        elements.namedItem("i-type") && (elements.namedItem("i-type").value = data.type)
        elements.namedItem("sub-val") && (elements.namedItem("sub-val").value = edge["label"])

        document.getElementById("jTabPill").click()


    }

});




/**
 * 
 * 
 *  Site Methods
 * 
 * 
 * 
 * 
 */

function generateSiteID(x, y){
    return String(x) + "," + String(y)
}

function upsertSite(label, x, y, theta, thetaInc, phi, phiInc, type){
    console.log(type);
    id = generateSiteID(x,y)
    x = parseFloat(x) * 250
    y = parseFloat(y) * -250
    nodes.update({"id": id, "label": label, "x": x, "y": y, "theta": theta, "thetaInc": thetaInc, "phi": phi, "phiInc": phiInc, "type": type, color: (type == 0 ? "#769FB6" :"#CAD9E2") })
    network.redraw();
}

function removeSite(x,y){
    nodes.remove(generateSiteID(x,y))
    network.redraw();
}


/**
 * 
 * 
 *      Interaction Methods
 *  
 * 
 * 
 * 
 */

function upsertInteraction(label1, x1, y1, label2, x2, y2, altLabel, nearest){

    label = altLabel =! NaN ? altLabel : "" // sub label

    if (nodes.get(generateSiteID(x2,y2)) == null && nodes.get(generateSiteID(x1,y1)) != null){ // create extralattice node
        
        //get node properties
        options = undefined
        nodes.forEach((node)=> {
            if(node.label == label2) {
                options = node
            }
        })

        if (options != undefined) {
            upsertSite(label2, x2, y2, options.theta, options.thetaInc,options. phi, options.phiInc, 1)
        }
        
        
    }

    if(nodes.get(generateSiteID(x2,y2)) != null && nodes.get(generateSiteID(x1,y1)) != null){
        edges.update({id: genInteractionID(label1, label2), "from": generateSiteID(x1,y1), "to": generateSiteID(x2,y2), "label": label, type: 0, "type": parseInt(nearest), smooth: nearest == 1 ? false : {enabled: true, type: (nearest == 2 ? 'curvedCCW' :'curvedCW'), roundness: 0.2}})
        network.redraw();  
    }

}

function removeInteraction(x1, y1, x2, y2){
    edges.remove(generateSiteID(x1,y1) + "-" + generateSiteID(x2,y2))
    network.redraw();
}

function genInteractionID(srcName, dstName){
    var edgeName = "J" + srcName + dstName
    subs = edges.get().map( edge => edge['id']);
    subMap = subs.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    var num = 0
    while(subMap.has(edgeName + num)) num++;
    edgeName = edgeName + num
    return edgeName
}


/**
 * 
 * 
 * 
 * Form Actions
 * 
 * 
 * 
 * 
 */

//Handler
function handleSubmit(event) {

    event.preventDefault();
    const value = getFormData(event.target)

    console.log(value);

    if (event.target.getAttribute('id') == "addNode"){handleNewSite(value)}
    else if (event.target.getAttribute('id') == "addEdge"){handleNewInteraction(value)}

}

function getFormData(target){

    const formData = new FormData(target);
    const data = Object.fromEntries(formData.entries());

    Object.keys(data).forEach((key) => {
        if (key != "name" && key != "name-src" &&  key != "name-dst" &&  key != "sub-val") data[key] = parseFloat(data[key])
    })

    return data
}

//Add Event Listener
document.getElementById("addNode").addEventListener('submit', handleSubmit);
document.getElementById("addEdge").addEventListener('submit', handleSubmit);

//Handle Form Submit for new Site
function handleNewSite(data){
    upsertSite("S" + data["name"], data["x"], data["y"], data["t-val"], data["t-inc"], data["p-val"], data["p-inc"], 0)
}

//Handle Form Submit for new Interaction
function handleNewInteraction(data){
    upsertInteraction("S" + data["name-src"], data["x-src"], data["y-src"], "S" + data["name-dst"], data["x-dst"], data["y-dst"], data["sub-val"], data["nearest"])
}

//Handle Remove Site
function handleRemoveSite(){
    var form = document.getElementById("addNode")
    data = getFormData(form)
    removeSite(data["x"], data["y"])
}

//Handle Remove Interaction
function handleRemoveInteraction(){
    var form = document.getElementById("addEdge")
    data = getFormData(form)
    removeInteraction(data["x-src"], data["y-src"], data["x-dst"], data["y-dst"])
}

/**
 * 
 * 
 *  Testing
 * 
 * 
 */

/*
upsertSite("S1", 0,0,0,0,0,0,0)
upsertSite("S2", 1,0,0,0,0,0,0)
upsertSite("S3", 0,1,0,0,0,0,0)

upsertInteraction("S1", 0, 0, "S2", 1, 0, "J1", 1)
upsertInteraction("S1", 0, 0, "S3", 0, 1, "J1", 1)

upsertInteraction("S2", 1, 0, "S1", 2, 0, "J1", 1)
upsertInteraction("S3", 0, 1, "S1", 0, 2, "J1", 1)

upsertInteraction("S1", 0, 0, "S1", 2, 0, "J1'", 2)
upsertInteraction("S2", 1, 0, "S2", 3, 0, "J1'", 2)

upsertInteraction("S1", 0, 0, "S3", 0, 2, "J1'", 3)
upsertInteraction("S3", 0, 1, "S3", 0, 3, "J1'", 3)
*/