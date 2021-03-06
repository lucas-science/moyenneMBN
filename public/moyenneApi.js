let moyenneVal = document.getElementById('moyenneVal')
let form = document.getElementById("login")
let loader = document.getElementById("loader")
let share = document.getElementById("share")
let textshared = document.getElementById('textshared')

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
form.addEventListener('submit', async(event) => {
    // ...
    // stop form submission
    event.preventDefault();
    loader.classList.remove("none");
    loader.classList.add("loader");
    let id = form.elements['id'].value;
    let password = form.elements['password'].value
    const result = await fetch("https://moyennembn.herokuapp.com/getVal", {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            mdp: password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let data = await result.json()
    if (data) {
        loader.classList.remove("loader");
        loader.classList.add("none");
    }
    moyenneVal.innerText = data.val
});

share.addEventListener('click', () => {
    var copyText = document.getElementById("myInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
})
