const socket = io();
const sendLocation = document.querySelector(".send-location");
const chatRoom = document.querySelector(".chatRoom");
const from = document.querySelector("form");
const sendButton = from.querySelector("button");


const {username, room} = Qs.parse(location.search, {"ignoreQueryPrefix": true})
socket.on("message", ({message: {message, createdAt}, username, roomName, roomUsers}) =>
{
    if (roomName) {
        document.querySelector(".roomName").innerHTML = roomName
    }
    if (roomUsers) {
        const list = document.querySelector("aside ul");
        list.innerHTML = "";
        for (const roomUser of roomUsers) {            
            list.insertAdjacentHTML("beforeend", `
                <li>${roomUser.username}</li>
            `);
        }
        autoScroll(list);
    }
    chatRoom.insertAdjacentHTML("beforeend", `
        <div class="perMessage">
            <p>${username}</p>
            <p>${message} - <span class="time">${getTime(createdAt)}</span></p>
        </div>
    `)

    autoScroll(chatRoom);

})

function autoScroll(element) {
    const scrollOffset = element.scrollHeight;
    element.scroll({top: scrollOffset, behavior: "smooth"});
}
socket.on("locationMessage", (googleLink) =>
{
    const {message, createdAt} = googleLink;
    chatRoom.insertAdjacentHTML("beforeend", `
    <div class="perMessage">
        <p>User Name</p>
        <a href='${message}' target="_blank">Google Map Location <span class="time"> - ${getTime(createdAt)}</span></a>
    </div>
    `);
})


from.addEventListener("submit", (e) =>
{
    e.preventDefault();

    sendButton.setAttribute("disabled", "disabled");
    const message = e.target.elements.message;
    if (message.value.trim() == '') {
        return;
    }
    socket.emit("newMessage", message.value, (error) =>
    {
        message.value = ""
        message.focus();
        if (error) {
            console.log(error)
            return;
        }
        sendButton.removeAttribute("disabled");
        console.log("Message Delivered");
    });

})

sendLocation.addEventListener("click", (e) =>
{
    navigator.geolocation.getCurrentPosition(({coords}) =>
        {
            if (!navigator.geolocation) {
                return alert("Your Browser Haven't Geolocatiion support");
            }
            sendLocation.setAttribute("disabled", "disabled");

            socket.emit("sendLocation", {
                lat: coords.latitude,
                long: coords.longitude
            }, () =>
            {
                sendLocation.removeAttribute("disabled");
                console.log("Location Shared");
            });
            
        });
})

socket.on("userName", ({message: usName}) =>
{
    const ul = document.querySelector("ul");
    console.log(usName)
    ul.insertAdjacentHTML("beforeend", `
        <li>
            ${usName}
        </li>
    `);
})

function getTime(date)
{
    return moment(date).format("h:mm a");    
}




socket.emit("join", {username, room}, (message) =>
{
    alert(message)
    location.href = "/";
});