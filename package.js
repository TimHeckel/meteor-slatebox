Package.describe({
    summary: "Concept drawing and mind mapping"
});

Package.on_use(function (api) {

    api.use('jquery', 'client');

    api.add_files([
        'lib/client/Slatebox.js'
        , 'lib/client/Slatebox.slate.js'
        , 'lib/client/Slatebox.node.js'
        , 'lib/client/slate/Slatebox.slate.birdseye.js'
        , 'lib/client/slate/Slatebox.slate.canvas.js'
        , 'lib/client/slate/Slatebox.slate.keyboard.js'
        , 'lib/client/slate/Slatebox.slate.message.js'
        , 'lib/client/slate/Slatebox.slate.collab.js'
        , 'lib/client/slate/Slatebox.slate.multiselection.js'
        , 'lib/client/slate/Slatebox.slate.undoRedo.js'
        , 'lib/client/slate/Slatebox.slate.nodes.js'
        , 'lib/client/slate/Slatebox.slate.zoomSlider.js'
        , 'lib/client/node/Slatebox.node.colorpicker.js'
        , 'lib/client/node/Slatebox.node.connectors.js'
        , 'lib/client/node/Slatebox.node.context.js'
        , 'lib/client/node/Slatebox.node.editor.js'
        , 'lib/client/node/Slatebox.node.images.js'
        , 'lib/client/node/Slatebox.node.links.js'
        , 'lib/client/node/Slatebox.node.menu.js'
        , 'lib/client/node/Slatebox.node.relationships.js'
        , 'lib/client/node/Slatebox.node.resize.js'
        , 'lib/client/node/Slatebox.node.shapes.js'
        , 'lib/client/node/Slatebox.node.template.js'
        , 'lib/client/node/Slatebox.node.toolbar.js'
        , 'lib/client/node/Slatebox.node.lineOptions.js'

        , 'lib/client/raphael/raphael.js'
        , 'lib/client/raphael/raphael.fn.objects.js'
        , 'lib/client/raphael/raphael.fn.connection.js'
        , 'lib/client/raphael/raphael.el.tooltip.js'
        , 'lib/client/raphael/raphael.el.style.js'
        , 'lib/client/raphael/raphael.el.loop.js'
        , 'lib/client/raphael/raphael.button.js'

        , 'lib/client/emile/emile.js'

        , 'lib/client/notify.js'
        , 'lib/client/spinner.js'
        , 'lib/client/slatebox.css'

        , 'lib/client/images/2_lines.png'
       
    ], 'client');
});