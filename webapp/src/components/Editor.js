import React, { useState, useEffect } from 'react';
import '../styles/Editor.css';
import WithSidebar from './Sidebar';
import { Redirect } from 'react-router-dom';
import Constants from '../constants.js';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-twilight';

function Editor(props) {
  const [playerName, setPlayerName] = useState('');
  const [redirect, setRedirect] = useState(null);
  const [editorCode, setEditorCode] = useState(Constants.defaultEditorCode);

  const JsAceEditor = (
    <AceEditor
      className="editor"
      width="800"
      height="1000"
      placeholder=""
      mode="javascript"
      theme="twilight"
      name="hexgrid_ai_editor"
      onLoad={onEditorLoad}
      onChange={onEditorChange}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={editorCode}
      setOptions={{
        showLineNumbers: true,
        tabSize: 4,
      }}
    />
  );

  // componentDidMount
  useEffect(() => {
    // load player name from local storage
    const savedPlayerName = localStorage.getItem(Constants.LOCAL_STORAGE_PLAYER_NAME);
    setPlayerName(savedPlayerName);
    document.getElementById('input-player-name').textContent = savedPlayerName;
  }, []);

  const editorSidebarElements = [
    <span
      key={0}
      id="input-player-name"
      className="sidebar-item interactable single-line"
      contentEditable
      suppressContentEditableWarning={true}
      placeholder="enter algorithm name.."
      spellCheck={false}
      onInput={(e) => setPlayerName(e.target.textContent)}
    />,
    <hr key={1} />,
    <span key={2} className="sidebar-item interactable" onClick={onSave}>
      Save
    </span>,
    <span key={3} className="sidebar-item interactable" onClick={onCompile}>
      Compile
    </span>,
  ];

  const Content = () => {
    if (redirect) {
      return (
        <Redirect
          to={{
            pathname: redirect,
            state: {
              playerName: playerName,
              playerCode: editorCode,
            },
          }}
        />
      );
    }

    return <WithSidebar sidebarElements={editorSidebarElements} content={JsAceEditor} />;
  };

  function onEditorLoad(editorInstance) {
    editorInstance.resize();

    const savedCode = localStorage.getItem(Constants.LOCAL_STORAGE_EDITOR_CODE);
    if (savedCode) {
      editorInstance.setValue(savedCode, 1);
    }
  }

  function onEditorChange(value, event) {
    setEditorCode(value);
  }

  function onSave() {
    if (!playerName.trim()) {
      setPlayerName(Constants.defaultPlayerName);
    }

    if (!editorCode.trim()) {
      setEditorCode(Constants.defaultEditorCode);
    }

    // save editor code and player name to local storage
    localStorage.setItem(Constants.LOCAL_STORAGE_PLAYER_NAME, playerName);
    localStorage.setItem(Constants.LOCAL_STORAGE_EDITOR_CODE, editorCode);
  }

  function onCompile() {
    onSave();
    setRedirect('/versus');
  }

  // has to be wrapped in html tag: <span> to make inline
  return <span>{Content(props)}</span>;
}

export default Editor;
