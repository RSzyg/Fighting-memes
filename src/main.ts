window.onload = function() {
    let div: HTMLElement = document.getElementById('display');
    let para: HTMLElement = document.createElement('p');
    para.innerHTML = 'Hello!';
    div.appendChild(para);
}