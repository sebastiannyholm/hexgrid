import React from 'react';
import '../styles/NavBar.css';

import { Link, withRouter } from 'react-router-dom';

const navItems = [
  { path: '/editor', name: 'Editor' },
  { path: '/versus', name: 'Player Selection' },
  { path: '/game', name: 'Play Offline' },
  { path: '/live', name: 'Play Online' },
  { path: '/docs', name: 'Rules & Documentation' },
];

export const NavBar = (props) => {
  return <div className="navbar">{props.children}</div>;
};

function WithNavigation(props) {
  return (
    <div className="with-nav">
      <NavBar>
        {navItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={'nav-item' + (props.location.pathname === item.path ? ' nav-item-focus' : '')}
          >
            {item.name}
          </Link>
        ))}
      </NavBar>

      <div className="with-nav-content">{props.children}</div>
    </div>
  );
}

export default withRouter(WithNavigation);
