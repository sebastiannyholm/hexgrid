import React from 'react';

const Rules = (
  <div id="rules">
    <h1>Rules</h1>
    <p>Write a script and compete against other AIs in a Batte Royal fight to conquer the hexagonal grid.</p>

    <h3>The setup</h3>
    <ul className="list-view">
      <li>You start with just a single hexagon cell in the grid and 10 resources.</li>
      <li>
        To take over a cell you must transfer resources from a cell that you own to one of its neighbors.
        <br />
        If the amount of resources transferred exceeds that of the targeted cell, you will take control of that cell.
      </li>
      <li>One transaction is available to each player every round.</li>
      <li>
        After each round all cells occupied by players gain 1 resource, until they reach their natural growth max.
      </li>
    </ul>

    <h3>Transaction rules</h3>
    <ul className="list-view">
      <li>Transfered resources must be a non-negative integer.</li>
      <li>You cannot transfer more resources from a cell than is available to that cell.</li>
      <li>Resources can only be transfered from cells that you own.</li>
      <li>
        Transactions must include distinct cells - i.e. it is not possible for a cell to be both donor and recipient in
        a transaction.
      </li>
      <li>
        The cells of a transaction must be neighbors when attacking (transferring resources from an owned cell to a
        non-owned cell).
      </li>
      <li>
        Transaction between cells that are both owned by the player does not have to be neighbors, although they must
        still be connected through other cells of that player.
      </li>
      <li>It is possible for a transaction to cause the receiving cell to exceed its natural growth.</li>
    </ul>

    <h3>Mining field</h3>
    <ul className="list-view">
      <li>Surrounding each player's initial cell are six unoccupied cells with a random amount of resources.</li>
      <li>
        Getting through the mining field gives access to the rest of the grid, where unoccupied cells are freely
        available.
      </li>
      <li>While the mining field resources are randomly generated, they are the same for every player in the grid.</li>
      <li>The mining field resources are shuffled around for each player to spice things up a bit.</li>
    </ul>

    <h3>Super cells</h3>
    <ul className="list-view">
      <li>Regular cells have a maximum natural growth of 100 resources.</li>
      <li>Super cells are cells that will continue to grow until they reach 300 resources.</li>
      <li>Super cells are indicated on the grid with lines across it.</li>
      <li>Super cells are located just beyond the mining field of each player.</li>
    </ul>
  </div>
);

export default Rules;
