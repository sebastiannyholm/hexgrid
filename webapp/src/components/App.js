import React from 'react';
import './App.css';

import WithNavigation from './NavBar';
import Editor from './Editor';
import DocsRules from './DocsRules';
import Versus from './Versus';
import GameOffline from './GameOffline';
import GameLive from './GameLive';

import {
	BrowserRouter as Router,
	Route,
	Redirect,
} from "react-router-dom";

function App() {
	// const [msg, setMsg] = useState("msg");

	return (
		<Router>
			<Route
				exact path="/"
				render={() =>
					<Redirect to="/editor" />
				}
			/>
			<Route
				path="/editor"
				render={() =>
					<WithNavigation>
						<Editor />
					</WithNavigation>
				}
			/>
			<Route
				path="/versus"
				render={() =>
					<WithNavigation>
						<Versus />
					</WithNavigation>
				}
			/>
			<Route
				path="/game"
				render={() =>
					<WithNavigation>
						<GameOffline />
					</WithNavigation>
				}
			/>
			<Route
				path="/live"
				render={() =>
					<WithNavigation>
						<GameLive />
					</WithNavigation>
				}
			/>
			<Route
				path="/docs"
				render={() =>
					<WithNavigation>
						<DocsRules />
					</WithNavigation>
				}
			/>
		</Router>
	);
}

export default App;
