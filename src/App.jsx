import React, { useEffect, useState } from 'react';
const config = require('../config');

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:${config.PORT}/api/users`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        setUsers(data);
      });
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul id="user-list">
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
