import React, { useEffect, useState } from 'react';

function UserGrid() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState({});

    useEffect(() => {
        fetch('http://localhost:3001/users')
            .then(response => response.json())
            .then(data => setUsers(data));
    }, []);

    const handleUserTypeChange = (userId, type) => {
        fetch(`http://localhost:3001/roles?type=${type}`)
            .then(response => response.json())
            .then(data => setRoles(prev => ({ ...prev, [userId]: data })));
    };

    return (
        <div>
            <h1>User Grid</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>
                                <select
                                    value={user.type}
                                    onChange={e => handleUserTypeChange(user.id, e.target.value)}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </td>
                            <td>
                                <select>
                                    {roles[user.id] && roles[user.id].map(role => (
                                        <option key={role.role} value={role.role}>{role.role}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserGrid;
