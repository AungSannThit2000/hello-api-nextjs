import { useEffect, useState } from "react";

export default function UserList() {
    const [users, setUsers] = useState([]);

    // State for the Popup Window
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // --- 1. FETCH USERS (Read) ---
    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const res = await fetch(`${API_URL}/api/user`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("API did not return a list:", data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // --- 2. DELETE USER ---
    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await fetch(`${API_URL}/api/user?id=${id}`, { method: "DELETE" });
            // Update UI immediately
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert("Failed to delete user");
        }
    }

    // --- 3. MODAL FUNCTIONS (Open & Type) ---
    function openEditModal(user) {
        setEditingUser(user);
        setIsModalOpen(true);
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setEditingUser({ ...editingUser, [name]: value });
    }

    // --- 4. SAVE CHANGES (Update) ---
    async function saveUser() {
        try {
            const res = await fetch(`${API_URL}/api/user`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: editingUser._id,
                    firstname: editingUser.firstname,
                    lastname: editingUser.lastname,
                    email: editingUser.email
                }),
            });

            if (res.ok) {
                // Update the list locally
                setUsers(users.map(u => (u._id === editingUser._id ? editingUser : u)));
                setIsModalOpen(false);
                alert("User updated successfully!");
            } else {
                alert("Failed to update.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    // --- HTML DISPLAY ---
    return (
        <div style={{ padding: "20px" }}>
            <h2>User Management</h2>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th> {/* Added Email Header */}
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.email}</td> {/* Added Email Data */}
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>
                                <button onClick={() => openEditModal(user)}>Edit</button>
                                &nbsp;
                                <button onClick={() => handleDelete(user._id)} style={{ color: 'red' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- EDIT POPUP WINDOW --- */}
            {isModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{
                        backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "300px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                    }}>
                        <h3>Edit User</h3>

                        <label>First Name:</label><br />
                        <input
                            type="text" name="firstname"
                            value={editingUser.firstname || ""}
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "10px" }}
                        /><br />

                        <label>Last Name:</label><br />
                        <input
                            type="text" name="lastname"
                            value={editingUser.lastname || ""}
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "10px" }}
                        /><br />

                        <label>Email:</label><br />
                        <input
                            type="email" name="email"
                            value={editingUser.email || ""}
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "20px" }}
                        /><br />

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button onClick={saveUser} style={{ backgroundColor: "green", color: "white", padding: "5px 10px" }}>
                                Save
                            </button>
                            <button onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "gray", color: "white", padding: "5px 10px" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}