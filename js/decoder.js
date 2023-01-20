/**
 * 
 * 
 *      Decoder
 *      Desc: Takes in a configuration file and loads it into the graph
 * 
 * 
 */


/**
 * 
 *  Decode
 *  Desc: driving function for decoder
 * 
 */
function decode(){

    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);

    var lines = getLines();
    var subs = new Map()
    if (lines == null) return; // user cancelled or did not enter anything

    console.log(lines);

    sectionIndexes = [
        [0, parseInt(lines[0])],
        [parseInt(lines[0]) + 1, parseInt(lines[parseInt(lines[0]) + 1])], 
        [parseInt(lines[parseInt(lines[0]) + 1]) + 1 + parseInt(lines[0]) + 1, parseInt(lines[parseInt(lines[parseInt(lines[0]) + 1]) + 1 + parseInt(lines[0]) + 1])]
    ]
    
    //Nodes
    for (let i = sectionIndexes[0][0] + 1; i < sectionIndexes[0][0] + sectionIndexes[0][1] + 1; i++) {
        var line = lines[i].split(" ")
        upsertSite(line[0], parseFloat(line[5]), parseFloat(line[6]), parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]), parseFloat(line[4]), 0)
        
    }

    //Subs
    for (let i = sectionIndexes[2][0] + 1; i < sectionIndexes[2][0] + sectionIndexes[2][1] + 1; i++) {
        var line = lines[i].split("=")
        subs.set(line[0].trim(), line[1].trim())
    }

    //Interactions
    for (let i = sectionIndexes[1][0] + 1; i < sectionIndexes[1][0] + sectionIndexes[1][1] + 1; i++) {
        var line = lines[i].split(" ")
        upsertInteraction(line[1], line[2], line[3], line[4], line[6], line[7], subs.get(line[0].trim()) != undefined ? subs.get(line[0].trim()) : NaN, line[8])
    }

    console.log(nodes);

    network.setData({nodes: nodes, edges: edges})
    network.redraw()


}

/**
 * 
 * 
 *  getLines
 *  Desc: prompts user to paste in config file and returns array containing relvant info
 */
function getLines(){

    var modal = bootstrap.Modal.getInstance(document.getElementById('decodeModal'));

    modal.hide();

    var file = document.getElementById("decodeText").value;

    if (file == null || file == "") return null // nothing was enter or it was cancelled


    file = file.split("\n")
    for (let index = file.length - 1; index >= 0 ; index--) {
        var line = file[index].trim();
        if (line.trim().startsWith("#") || line == ""){ file.splice(index, 1); continue }

        for (let j = 0; j < line.length; j++) {
            if(line.charAt(j) == "#"){
                line = line.substring(0 ,j)
                break
            }
        }

        file[index] = line

    }

    return file

}

/**
 * 
 * 
 *  Add Cmd-I for import
 * 
 */

 document.addEventListener("keydown", function(e) {
    if (e.key === 'i' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        
        navigator.clipboard.readText().then(text => {
            document.getElementById("decodeText").value = text
            var modal = new bootstrap.Modal(document.getElementById('decodeModal'), {
                keyboard: false
            })
            modal.show();
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });

    }
  }, false);