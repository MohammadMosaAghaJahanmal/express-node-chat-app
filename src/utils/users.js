const users = [];


// Add User
function addUser(id, username, room) 
{
    username = username.trim();
    room = room.trim();

    if (!username || !room) {
        return {
            error: "Username and room are required"
        }
    }

    const isExists = users.find((user) => 
    (user.username.toLowerCase() === username.toLowerCase()) 
    && 
    (user.room.toLowerCase() === room.toLowerCase())
    );
    if (isExists) {
        return {
            error: "User is in use"
        }
    }
    console.log("AFTER EXISTS");
    const user = {id, username, room}
    users.push(user);
    return {user};
}


// Remove User By Id
function removeUser(id)
{
    const userIndex = users.findIndex(user => user.id == id);
    if (userIndex == -1) {
        return {
            'error': "User Doesnot Exists"
        }
    }
    
    return users.splice(userIndex, 1)[0];
    
}

// Get User By Id
function getUser(id) {
    return users.find(user => user.id === id);
}

// Get Room Users By Room Name
function getRoomUsers(room) {
    return users.filter(user => user.room.toLowerCase() === room.toLowerCase())
}

module.exports = {
    addUser, 
    removeUser,
    getUser,
    getRoomUsers
}