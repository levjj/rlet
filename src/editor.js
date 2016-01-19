import React, { Component, PropTypes } from 'react';
import { PageHeader, Row, Col, Panel, Button, Glyphicon, Input } from 'react-bootstrap';
import AceEditor from 'react-ace/src/ace.jsx';
import ReactDOM from 'react-dom';
import $ from 'jquery';

require('brace/mode/javascript');
require('brace/mode/html');
require('brace/theme/eclipse');
require('../node_modules/bootstrap/dist/css/bootstrap.css');

export default class App extends Component {

  onAceLoad(editor) {
    editor.getSession().setTabSize(2);
    editor.renderer.setShowGutter(true);
  }

  state = {
    js: `rlet counting = subscribe($("#countbtn").click) initially(false)
                !counting;
rlet count = subscribe(interval(100)) initially(0)
             counting ? count + 1 : count;
rlet txt = counting ? ("Count: " + count) : "Paused";
subscribe(txt) {
  $("#countBtn").text(txt);
}`,
    jsModified: false,
    html: `<button id="countBtn"></button>`,
    htmlModified: false
  }

  onChangeHTML(src) {
    if (src !== this.state.html) {
      this.setState({
        ...this.state,
        html: src,
        htmlModified: true
      });
    }
  }

  onChangeJS(src) {
    if (src !== this.state.html) {
      this.setState({
        ...this.state,
        js: src,
        jsModified: true
      });
    }
  }

  htmlEditor() {
    return (
      <AceEditor mode="html"
                theme="eclipse"
                name="ace-html"
                height="20vh"
                width="100%"
                fontSize={14}
                value={this.state.html}
                onChange={this.onChangeHTML.bind(this)}
                onLoad={this.onAceLoad} />);
  }

  jsEditor() {
    return (
      <AceEditor
                theme="eclipse"
                name="ace-js"
                height="40vh"
                width="100%"
                fontSize={14}
                value={this.state.js}
                onChange={this.onChangeJS.bind(this)}
                onLoad={this.onAceLoad} />);
  }

  componentDidMount() {
    var count = 0, counting = true;
    setInterval(function() {
      if (counting) {
        count++;
        $("#countBtn").text('Count: ' + count);
      }
    }, 100);
    $("#countBtn").click(function() {
      counting = !counting;
      $("#countBtn").text(
        counting ? "Count: " + count : "Paused");
    });
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <PageHeader>Reactive Variables in JavaScript</PageHeader>
        </Col>
        <Col xs={6}>
        <Panel header="HTML" bsStyle={this.state.htmlModified ? "warning" : "success"}>
            {this.htmlEditor()}
          </Panel>
          <Panel header="JavaScript" bsStyle={this.state.jsModified ? "warning" : "success"}>
            {this.jsEditor()}
          </Panel>
        </Col>
        <Col xs={6}>
          <Panel header="Live View" bsStyle="success">
            <button id="countBtn">0</button>
          </Panel>
        </Col>
      </Row>);
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
