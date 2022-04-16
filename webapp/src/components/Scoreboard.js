import React from 'react';
import '../styles/Scoreboard.css';

function Scoreboard({ rows }) {
  if (rows.length === 0) {
    return <table></table>;
  }

  return (
    <table className="table-scroll">
      <thead>
        <tr>
          {Object.keys(rows[0].data).map((key) => {
            return (
              <th key={key} className="capitalize">
                {key}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          return (
            <tr key={index} style={{ color: row.color.fg, backgroundColor: row.color.bg }}>
              {Object.keys(row.data).map((key) => {
                return <td key={key}>{row.data[key].toString()}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Scoreboard;
