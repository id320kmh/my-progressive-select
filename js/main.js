//@prepros-append index.js

//-------------- Console log STYLE ------------------------------------------

const consoleStyles =  {
    'h1': 'font: 2.5em/1 Arial; color: crimson;',
    'h2': 'font: 2em/1 Arial; color: orangered;',
    'h3': 'font: 1.5em/1 Arial; color: olivedrab;',
    'bold': 'font: bold 1.3em/1 Arial; color: midnightblue;',
    'warn': 'padding: 0 .5rem; background: crimson; font: 1.6em/1 Arial; color: white;'
};

function log ( msg, style ) {
    if ( !style || !consoleStyles[ style ] ) {
        style = 'bold';
    }
    console.log ( '%c' + msg, consoleStyles[ style ] );
}

//---------------------------------------------------------------------------

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

    init() {
        // this.changeListIcon();
        this.cacheElements();
        this.bindEvents();
    }
    cacheElements(){
        this.$doc = document;
        this.$body = document.body;
        this.$mySelectButton = document.querySelector(this.selector).querySelector('.section__button');
        this.$mySelectStateIcon = document.querySelector(this.selector).querySelector('.my-select-state-icon');
        this.$myLabel = document.querySelector(this.selector).querySelector('.my-label');
        this.$techListElement = document.getElementsByClassName('section__technology-list')[0];

        this.$listItem = document.getElementsByClassName('section__technology-item');
        this.$selectInput = document.getElementsByClassName('section__button')[0];
    }
    bindEvents() {
        let that = this;

        document.addEventListener('click', function (event) {
            that.closeList(event.target);
        }, false);

        this.$mySelectButton.addEventListener('click', function() {
            if (!that.listState) {
                that.animChanges().stateFirst();
            } else {
                that.animChanges().stateSecond();
            }
        });
        
    }

    closeList(elem) {

        // console.log(that.listState);
        // log('Clicked outside list', 'bold');
        
        if ( this.listState 
            && elem.classList[0] !== 'section__button' 
            && elem.classList[0] !== 'section__technology-list' 
            && elem.classList[0] !== 'section__technology-item') {
            this.animChanges().stateSecond();
        }
        
        
    }
    animChanges() {

        return {
            stateFirst: () => {
                this.$mySelectStateIcon.classList.toggle("list-button-state-1");
                this.$mySelectStateIcon.classList.toggle("list-button-state-2");
                this.$myLabel.classList.add("my-label_active");
                this.$techListElement.classList.remove('section__technology-list_unvisible');   
                if (!this.list.length) {                     
                    this.getList(this.url); 
                } 
                this.listState = !this.listState;
            },
            stateSecond: () => {
                this.$mySelectStateIcon.classList.toggle("list-button-state-2");
                this.$mySelectStateIcon.classList.toggle("list-button-state-1");
                
                if (!this.choiceState) {
                    this.$myLabel.classList.remove("my-label_active");
                }
                this.$techListElement.classList.add('section__technology-list_unvisible');
                this.listState = !this.listState;
            }
        }
    }

    async getList(userURL) {

        this.animateDownloadStatus().start(); 
        
        console.log('Started receiving data...');
        
        let response = await fetch(userURL);
        const reader = response.body.getReader();

        const contentLength = +response.headers.get('Content-Length');
        // console.log(contentLength);
        

        let receivedLength = 0; 
        let chunks = [];
        while(true) {
            const {done, value} = await reader.read();

            if (done) {        
                // downloadStatus.classList.remove('download-status_active');
                this.animateDownloadStatus().stop(); 
                console.log('Receiving has done!');
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

    animateDownloadStatus() {
        const downloadStatus = document.getElementsByClassName('download-status')[0];
        return {
            start: () => {
                downloadStatus.classList.add('download-status_active');
            },
            stop: () => {
                downloadStatus.classList.remove('download-status_active');
            }
        }
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
myProgressiveSelector.init();













