//@prepros-append index.js


const progressiveSelectOptions = {
    selector: '.section__button-container',
    label: 'Choose Technology',
    url: 'https://test1-c0ab0.firebaseio.com/technology.json'
}

// ----- Класс нашего селектора, который содержит конструктор 
class ProgressiveSelect{
    constructor(options){
        this.selector = options.selector;
        this.label = options.label;
        this.url = options.url;
    }
    listState = false; // --- флаг иконки открытого/закрытого списка  
    choiceState = false; // --- флаг выбран ли какой-то элемент со списка
    list = [];
    //----- changeListIcon() - функция отслеживает флаг listState и переворачивает иконку 
    changeListIcon() {
        let that = this;
        const mySelectContainer = document.querySelector(this.selector);
        const mySelectButton = mySelectContainer.querySelector('.section__button');
        const mySelectStateIcon = mySelectContainer.querySelector('.my-select-state-icon');
        const myLabel = mySelectContainer.querySelector('.my-label');
        const techListElement = document.getElementsByClassName('section__technology-list')[0];
        

        mySelectButton.addEventListener('click', function() {
            if (!that.listState) {
                mySelectStateIcon.classList.toggle("list-button-state-1");
                mySelectStateIcon.classList.toggle("list-button-state-2");
                myLabel.classList.add("my-label_active");
                if (!that.list.length) { 
                    that.getList(that.url); 
                } 
                techListElement.classList.remove('section__technology-list_unvisible');   
                that.listState = !that.listState;
            } else {
                mySelectStateIcon.classList.toggle("list-button-state-2");
                mySelectStateIcon.classList.toggle("list-button-state-1");
                console.log(that.choiceState);
                
                if (!that.choiceState) {
                    myLabel.classList.remove("my-label_active");
                }
                techListElement.classList.add('section__technology-list_unvisible');
                that.listState = !that.listState;
            }
        });
    }
    async getList(userURL) {
        const downloadStatus = document.getElementsByClassName('download-status')[0];
        downloadStatus.classList.add('download-status_active');
        console.log('Starting receiving...');
        
        let response = await fetch(userURL);
        const reader = response.body.getReader();

        const contentLength = +response.headers.get('Content-Length');

        let receivedLength = 0; 
        let chunks = [];
        while(true) {
            const {done, value} = await reader.read();

            if (done) {        
                downloadStatus.classList.remove('download-status_active');
                console.log('Receiving has received!');
                break; 
            }

            chunks.push(value);
            receivedLength += value.length;

            console.log(`Получено ${receivedLength} из ${contentLength}`)
        }

        let chunksAll = new Uint8Array(receivedLength); 
        let position = 0;
        for(let chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }

        let result = new TextDecoder("utf-8").decode(chunksAll);
        this.showList( JSON.parse(result) );

    }
    showList(technology) {
        const techListElement = document.getElementsByClassName('section__technology-list')[0];

        if (!this.list.length) {
            for ( let tech in technology ) {
                let listItem = document.createElement('li');
                listItem.classList.add('section__technology-item');
                listItem.innerHTML = technology[tech].name;
                techListElement.appendChild(listItem);
                this.list.push(technology[tech].name);
            }
        }
        this.listClickListening();
    }
    listClickListening() {
        let that = this;
        const listItem = document.getElementsByClassName('section__technology-item');
        const selectInput = document.getElementsByClassName('section__button')[0];

        for (let elem of listItem){
            elem.addEventListener('click', function(event) { 

                resetListClass(elem.textContent)
                elem.classList.add('section__technology-item_active');
                that.choiceState = true;
                selectInput.value = elem.textContent;
            })
        }

        function resetListClass(itemValue) {
            for (let elem of listItem){
                if (elem.textContent !== itemValue) {
                    elem.classList.remove('section__technology-item_active');
                }
            }
        }
    }

}




const myProgressiveSelector = new ProgressiveSelect(progressiveSelectOptions);
myProgressiveSelector.changeListIcon();













