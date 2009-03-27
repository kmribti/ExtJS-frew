Ext.onReady(function(){
    // shorthand
    var Tree = Ext.tree;
    
    var tree = new Tree.TreePanel({
        el:'tree-div',
        useArrows:true,
        autoScroll:true,
        animate:true,
        enableDD:true,
        containerScroll: true,
        border: false,
        // auto create TreeLoader
        dataUrl: 'get-nodes.php',

        root: {
            nodeType: 'async',
            text: 'Ext JS',
            draggable:false,
            id:'source'
        }
    });

    // render the tree
    tree.render();
    tree.getRootNode().expand();
});