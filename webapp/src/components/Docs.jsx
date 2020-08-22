import React from 'react';

const Docs = <div id="docs">
    <h1>Documentation</h1>
    <p>To determine how to spend transactions, each player has access to an their owned cells denoted <code>myCells (PlayerCell[])</code>.<br/>
    Each algorithm's <code>turn</code> function will be called every round and should return a <code>transaction</code> object.
    </p>

    <h3><code>PlayerCell</code></h3>
    <ul className="list-view-indent">
        <li>
            <code>id (string)</code><br/>
            Unique identifier for the hexagon cell.
        </li>
        <li>
            <code>resources (int)</code><br/>
            Amount of resources available in the cell.
        </li>
        <li>
            <code>maxGrowth (int)</code><br/>
            How much the cell will naturally grow before not gaining anymore resources.
        </li>
        <li>
            <code>neighbors (NeighborCell[])</code><br/>
            Array of neighboring cells.
        </li>
    </ul>

    <h3><code>NeighborCell</code></h3>
    <ul className="list-view-indent">
        <li>
            <code>id (string)</code>	
            <br/>Unique identifier for the hexagon cell.
        </li>
        <li>
            <code>resources (int)</code> 
            <br/>Amount of resources available in the cell.
        </li>
        <li>
            <code>maxGrowth (int)</code>
            <br/>How much the cell will naturally grow before not gaining anymore resources.
        </li>
        <li>
            <code>owner (enum HexOwner)</code>
            <br/>The owner of this cell.
        </li>
    </ul>
        
    <h3><code>HexOwner</code></h3>
    <ul className="list-view-indent">
        <li>
            <code>NONE (int)</code> 
            <br/>Unoccupied hexagon controlled by no one.
        </li>
        <li>
            <code>OWN (int)</code> 
            <br/>Hexagon controlled by the player.
        </li>
        <li>
            <code>OTHER (int)</code> 
            <br/>Hexagon controlled another player.
        </li>
    </ul>

    <h3><code>Transaction</code></h3>
    <ul className="list-view-indent">
        <li>
            <code>fromId (string)</code> 
            <br/>Id of the cell from which resources will be taken.
        </li>
        <li>
            <code>toId (string)</code> 
            <br/>Id of the cell to receive the resources.
        </li>
        <li>
            <code>transferAmount (int)</code> 
            <br/>The amount of resources to be transfered.
        </li>
    </ul>
</div>

export default Docs;