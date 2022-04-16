import React from 'react';
import '../styles/Sidebar.css';
import logo from '../assets/logo.svg';

export function Sidebar(props) {
  return (
    <div className="sidebar">
      <img className="sidebar-header" src={logo} alt=""></img>
      {props.children}
    </div>
  );
}

function WithSidebar({ sidebarElements, content, ...otherProps }) {
  return (
    <div className="with-sidebar">
      <div className="sidebar-wrapper">
        <Sidebar>{sidebarElements}</Sidebar>
      </div>
      <div className="with-sidebar-content">{content}</div>
    </div>
  );
}

export default WithSidebar;
