import React, {Component, PropTypes} from 'react';
import {PageHeader, Row, Col, Panel, Button, Tabs, Tab} from 'react-bootstrap';
import AceEditor from 'react-ace/src/ace.jsx';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {genHtml} from './index';

require('brace/mode/html');
require('brace/theme/eclipse');
require('../node_modules/bootstrap/dist/css/bootstrap.css');

const params = (() => {
  const raw = window.location.href.match(/#(.*)$/);
  if (!raw) return {};
  const props = raw[1].split(/,/);
  const src = props.reduce((acc, p) => acc || p.startsWith('src=') && p, false);
  const html = props.reduce((acc, p) => acc || p.startsWith('html=') && p, false);
  return {
    src: src && decodeURIComponent(src.split(/=/)[1]),
    srcHtml: src && decodeURIComponent(html.split(/=/)[1]),
    isDemo: props.indexOf('demo') >= 0,
    hideTime: props.indexOf('notime') >= 0
  };
})();

export default class App extends Component {

  onAceLoad(editor) {
    editor.getSession().setTabSize(2);
    editor.renderer.setShowGutter(!params.isDemo);
  }

  state = {
    js: params.src || `rlet paused = subscribe($("#countBtn").click)
              initially(false) !paused;

rlet count = subscribe(interval(100))
             initially(0) paused ? count : count + 1;

rlet txt = paused ? "Paused" : "Count: " + count;

subscribe(txt) {
  $("#countBtn").text(txt);
}`,
    jsModified: false,
    html: params.srcHtml || `<button id="countBtn"></button>`,
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
                height={params.isDemo ? '10vh' : '20vh'}
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
                value={this.state.gen}
                onLoad={this.onAceLoad} />);
  }

  componentDidMount() {
    this.onChangeSubmit();
  }

  render() {
    return (<div>
      <Row>
        {!params.isDemo && (<Col xs={12}>
          <PageHeader>Reactive Variables in JavaScript</PageHeader>
        </Col>)}
        <Col xs={params.isDemo ? 8 : 6}>
          <Panel header="HTML" bsStyle={this.state.htmlModified ? "warning" : "success"} footer={this.state.error ? this.state.error : ''}>
            {this.htmlEditor()}
          </Panel>
          <Panel header="JavaScript" bsStyle={this.state.jsModified ? "warning" : "success"}>
            {this.jsEditor()}
          </Panel>
        </Col>
        <Col xs={params.isDemo ? 4 : 6}>
          <Tabs defaultActiveKey={1}>
            <Tab eventKey={1} title="Live View">
            <iframe style={{
              width: '100%',
              height: '60vh',
              border: '1px solid #ccc',
              padding: '20px'}}
                    srcDoc={this.state.gen} seamless={true}></iframe>
            </Tab>
            <Tab eventKey={2} title={params.isDemo ? 'Gen. Code' : 'Generated Code'}>
              {this.generatedEditor()}
            </Tab>
          </Tabs>
        </Col>
      </Row>
      {!params.isDemo && (<a href="https://github.com/levjj/rlet"><img style={{position: 'absolute', top: 0, right: 0, border: 0}} src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" /></a>)}</div>);
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
