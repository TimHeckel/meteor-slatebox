Slatebox for Meteor
===============

You can use the Slatebox mind mapping and concept drawing (slatebox.com) in Meteor. To install meteor-slatebox, you need to first have meteorite installed, then:

`mrt add slatebox`

To wire up real-time collaboration, you need to add these collections to your model

    Collaboration = new Meteor.Collection("collaboration");
    CollaborationMessages = new Meteor.Collection("collaborationUpdates");

Once the collections are subscribed to, put this in your client to bring up a demo page. More documentation will be coming at [Slateboxjs](http://dev.slatebox.com/) soon.

HTML:

    <template name="slatebox">
        <h2>Simple Slatebox.js - Meteor Demo</h2>
        <p>
            Open this page up in multiple browsers to see real-time collaboration in action</p>

        <div id="slateContainer">
            <div id="slate">
            </div>
            <div id="slateJson">
                <p>
                    Current JSON (can be used to save slate to a user's account at Slatebox.com)</p>
                    <textarea id='txtSlateJson'></textarea>
                    <div id="txtSlateLastUpdated">
                    </div>
                </div>
            </div>
            <div id="slateMessage">
        </div>
    </template>

JS:

    //removing all the entries at startup
    Meteor.startup(function() {
        Collaboration.remove({});
        CollaborationMessages.remove({});
    });

    Template.slatebox.rendered = function() {
  
      var $s = new Slatebox();
      var log = [], startTime = Math.round(new Date().getTime() / 1000);
  
      var _sessionName = "selectedSlateId", _exampleSlateId = "firstSlateExample";
  
      Session.set(_sessionName, _exampleSlateId);
  
      function upd() {
          Slatebox.el("txtSlateJson").value = _mainSlate.exportJSON();
          Slatebox.el("txtSlateLastUpdated").innerHTML = "last updated <b>" + new Date().toString();
      };
  
      var _mainSlate = $s.slate({
          id: _exampleSlateId //slate with the same ids can collaborate together.
          , container: 'slate'
          , viewPort: { width: 50000, height: 50000, allowDrag: true, left: 5000, top: 5000 }
          , showZoom: true
          , showBirdsEye: false
          , showStatus: false
          , showMultiSelect: false
          , onSlateChanged: function () {
              upd();
          }
          , collaboration: {
              allow: true
              , userIdOverride: Meteor.uuid().split('-')[0]
              , sessionName: _sessionName
              , callbacks: {
                  onCollaboration: function (name, msg) {
                      var secs = Math.round(new Date().getTime() / 1000) - startTime;
                      log.push(secs + " secs ago - " + name + ": " + msg.toLowerCase());
                      $("#slateMessage").html(log.reverse().join('<br/>'));
                      startTime = Math.round(new Date().getTime() / 1000);
                      upd();
                  }
  
              }
          }
      }).canvas.init({ imageFolder: "http://static.slatebox.com/cursors/" });
  
      var _nodes = [
          $s.node({ id: 'first_node', text: 'drag', xPos: 5090, yPos: 5120, height: 40, width: 80, vectorPath: 'roundedrectangle', backgroundColor: '90-#ADD8C7-#59a989', lineColor: "red", lineWidth: 2, allowDrag: true, allowMenu: true, allowContext: true })
          , $s.node({ id: 'second_node', text: 'me', xPos: 5290, yPos: 5080, height: 40, width: 100, vectorPath: 'ellipse', backgroundColor: '90-#2A8FBD-#14709a', lineColor: "red", lineWidth: 4, allowDrag: true, allowMenu: true, allowContext: true })
          , $s.node({ id: 'third_node', text: 'around', xPos: 5260, yPos: 5305, height: 40, width: 80, vectorPath: 'rectangle', backgroundColor: '90-#556270-#7b92ab', lineColor: "white", lineWidth: 5, allowDrag: true, allowMenu: true, allowContext: true })
      ];
      _mainSlate.nodes.addRange(_nodes);
      _nodes[1].relationships.addParent(_nodes[0], {});
      _nodes[2].relationships.addAssociation(_nodes[0], {});
      _nodes[2].relationships.addAssociation(_nodes[1], {});
      _mainSlate.init();
  
  };

CSS
    
      body
      {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          font-family: Trebuchet MS;
      }
      #slateContainer
      {
          width: 800px;
      }
      #slate
      {
          float: left;
          width: 400px;
          height: 400px;
          border: 1px solid red;
          margin: 4px;
          background-color: #777;
      }
      #slateJson
      {
          float: right;
          width: 350px;
          height: 400px;
          margin: 4px;
      }
      #slateJson textarea
      {
          width: 350px;
          height: 200px;
      }
      #txtSlateLastUpdated
      {
          padding: 4px;
          margin: 4px;
          border: 1px dashed #333;
          background-color: #FFFc51;
      }
      #slateMessage
      {
          clear: both;
          height: 90px;
          overflow: auto;
          width: 400px;
          margin: 4px;
          border: 1px solid #333;
          font-size: 10pt;
      }
      
      /*notify js */
      .embedBar
      {
          z-index: 9999;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          border-top: 1px solid #000;
          filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#333', endColorstr='#000'); /* for IE */
          background: -webkit-gradient(linear, left top, left bottom, from(#333), to(#000)); /* for webkit browsers */
          background: -moz-linear-gradient(top,  #333, #000); /* for firefox 3.6+ */
          color: #fff;
      }
      
      .lnkCloseMessage
      {
          font-size: 16pt;
          text-decoration: none;
          background-color: #F8F8F8;
          border: 1px dashed #ccc;
          padding: 2px 6px 2px 6px;
      }
      .lnkCloseMessage:hover
      {
          background-color: #000;
          color: #fff;
      }
      
      /* context menu */
      .sb_cm
      {
          width: 150px;
          position: absolute;
          background-color: #f8f8f8;
          border: 1px solid #333;
      }
      .sb_contextMenuItem
      {
          padding: 2px;
          margin: 3px;
          cursor: pointer;
          border: 1px dashed transparent;
      }
      .sb_contextMenuItem:hover
      {
          background-color: #f1f1f1;
          border: 1px dashed #ccc;
      }
