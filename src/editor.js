import React, {Component, PropTypes} from 'react';
import {PageHeader, Row, Col, Panel, Button, Tabs, Tab} from 'react-bootstrap';
import AceEditor from 'react-ace/src/ace.jsx';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {genHtml} from './index';

require('brace/mode/html');
require('brace/theme/eclipse');
require('../node_modules/bootstrap/dist/css/bootstrap.css');

export default class App extends Component {

  onAceLoad(editor) {
    // require('brace/mode/javascript');
    // editor.getSession().$mode.$highlightRules.$rules.no_regex.unshift({token: "keyword", regex: "rlet\\b"})
    editor.getSession().setTabSize(2);
    editor.renderer.setShowGutter(true);
  }

  state = {
    js: `rlet counting = subscribe($("#countBtn").click)
                initially(true) !counting;

rlet count = subscribe(interval(100))
             initially(0) counting ? count + 1 : count;

rlet txt = counting ? ("Count: " + count) : "Paused";

subscribe(txt) {
  $("#countBtn").text(txt);
}`,
    jsModified: false,
    html: `<button id="countBtn"></button>`,
    htmlModified: false,
    error: null
  };

  onChangeHTML(src) {
    if (src !== this.state.html) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.onChangeSubmit.bind(this), 3000);
      this.setState({
        ...this.state,
        html: src,
        htmlModified: true,
        error: null
      });
    }
  }

  onChangeJS(src) {
    if (src !== this.state.html) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.onChangeSubmit.bind(this), 3000);
      this.setState({
        ...this.state,
        js: src,
        jsModified: true,
        error: null
      });
    }
  }

  onChangeSubmit() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
    let error, gen;
    try {
      gen = genHtml(this.state.html, this.state.js);
      error = null;
    } catch(e) {
      error = e.toString();
      gen = '';
    }
    this.setState({
      ...this.state,
      htmlModified: false,
      jsModified: false,
      gen,
      error
    });
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

  generatedEditor() {
    return (
      <AceEditor mode="html"
                theme="eclipse"
                name="ace-gen"
                height="60vh"
                width="100%"
                fontSize={14}
                value={this.state.gen} />);
  }

  componentDidMount() {
    this.onChangeSubmit();
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <PageHeader>Reactive Variables in JavaScript</PageHeader>
        </Col>
        <Col xs={6}>
          <Panel header="HTML" bsStyle={this.state.htmlModified ? "warning" : "success"} footer={this.state.error ? this.state.error : ''}>
            {this.htmlEditor()}
          </Panel>
          <Panel header="JavaScript" bsStyle={this.state.jsModified ? "warning" : "success"}>
            {this.jsEditor()}
          </Panel>
        </Col>
        <Col xs={6}>
          <Tabs defaultActiveKey={1}>
            <Tab eventKey={1} title="Live View">
            <iframe style={{
              width: '100%',
              height: '60vh',
              border: '1px solid #ccc',
              padding: '20px'}}
                    srcDoc={this.state.gen} seamless={true}></iframe>
            </Tab>
            <Tab eventKey={2} title="Generated Code">
              {this.generatedEditor()}
            </Tab>
          </Tabs>
        </Col>
      </Row>);
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
