import React, { useState } from 'react';
import '../styles/DocsRules.css';
import WithSidebar from './Sidebar';

import Rules from './Rules';
import Docs from './Docs';

const contents = [
  { name: 'Rules', body: Rules },
  { name: 'Docs', body: Docs },
];

function DocsRules(props) {
  const [content, setContent] = useState(contents[0]);

  function showContent(index) {
    setContent(contents[index]);
  }

  return (
    <WithSidebar
      sidebarElements={contents.map((content, index) => {
        return (
          <span key={index} className="sidebar-item interactable" onClick={() => showContent(index)}>
            {content.name}
          </span>
        );
      })}
      content={content.body}
    />
  );
}

export default DocsRules;
