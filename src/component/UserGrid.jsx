import React, { useEffect, useState } from 'react';

function UserGrid() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState({});
    const [newUser, setNewUser] = useState({ name: '', type: 'viewer' });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('http://localhost:3000/api/users')
            .then(response => response.json())
            .then(data => setUsers(data));
    };

    const handleUserTypeChange = (userId, type) => {
        fetch(`http://localhost:3000/api/roles?type=${type}`)
            .then(response => response.json())
            .then(data => setRoles(prev => ({ ...prev, [userId]: data })));
    };

    const handleAddUser = () => {
        fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        })
            .then(response => response.json())
            .then(() => {
                fetchUsers();
                setNewUser({ name: '', type: 'viewer' });
            });
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleUpdateUser = () => {
        fetch(`http://localhost:3000/api/users/${editingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingUser),
        })
            .then(response => response.json())
            .then(() => {
                fetchUsers();
                setEditingUser(null);
            });
    };

    const handleDeleteUser = (userId) => {
        fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE',
        })
            .then(() => fetchUsers());
    };

    return (
        <div>
            <h1>User Grid</h1>
            <div>
                <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="New user name"
                />
                <select
                    value={newUser.type}
                    onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                </select>
                <button onClick={handleAddUser}>Add User</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{editingUser?.id === user.id ?
                                <input
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                /> : user.name}</td>
                            <td>
                                <select
                                    value={editingUser?.id === user.id ? editingUser.type : user.type}
                                    onChange={(e) => {
                                        if (editingUser?.id === user.id) {
                                            setEditingUser({ ...editingUser, type: e.target.value });
                                        } else {
                                            handleUserTypeChange(user.id, e.target.value);
                                        }
                                    }}
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
                            <td>
                                {editingUser?.id === user.id ? (
                                    <button onClick={handleUpdateUser}>Save</button>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditUser(user)}>Edit</button>
                                        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserGrid;