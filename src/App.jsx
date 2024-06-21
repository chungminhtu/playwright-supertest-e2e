import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/users')
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
