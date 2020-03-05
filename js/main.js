//@prepros-append index.js

//-------------- Console log STYLE ---------------------------------

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

//------------------------------------------------------------------

const progressiveSelectOptions = {
    selector: '.section__button-container',
    label: 'Choose Technology',
    url: 'https://test1-c0ab0.firebaseio.com/technology.json',
    setItem: { num: 5, status: false }
}


// ----- Конструктор нашего "селектора"
class ProgressiveSelect{
    constructor(options){
        this.selector = options.selector;
        this.label = options.label;
        this.url = options.url;
        this.setItem = options.setItem;
    }
    listState = false; // --- флаг иконки открытого/закрытого списка  
    choiceState = false; // --- флаг выбран ли какой-то элемент со списка
    localDataState = false; // --- данные сохранены локально (загружаются при первом открытии списка)
    activeItem = { num: null, name: '' }; // ---- выбранный элемент со списка 
    // list = [];
    list = {};

    

    init() {
        this.cacheElements();
        this.bindEvents();
        this.showResultUnderActionList();
    }

    cacheElements(){
        this.$doc = document;
        this.$body = document.body;
        this.$mySelectButton = document.querySelector(this.selector).querySelector('.section__button');
        this.$mySelectStateIcon = document.querySelector(this.selector).querySelector('.my-select-state-icon');
        this.$myLabel = document.querySelector(this.selector).querySelector('.my-label');
        this.$techListElement = document.getElementsByClassName('section__technology-list')[0];
        this.$sectionSelect = document.getElementsByClassName('section__button-container')[0];

        this.$listItem = document.getElementsByClassName('section__technology-item');
        this.$selectInput = document.getElementsByClassName('section__button')[0];
        this.$downloadStatus = document.getElementsByClassName('download-status')[0];
        this.$actionListResult = document.getElementsByClassName('action-list__result')[0].querySelector('span');
        // this.$actionList = document.getElementsByClassName('action-list')[0];

        //----------- action list ---------------------
        this.$actionItemOpen = document.getElementsByClassName('action-list__item-open')[0].querySelector('a');
        this.$actionItemClose = document.getElementsByClassName('action-list__item-close')[0].querySelector('a');
        this.$actionItemSet = document.getElementsByClassName('action-list__item-set')[0].querySelector('a');
        this.$actionItemGet = document.getElementsByClassName('action-list__item-get')[0].querySelector('a');
        this.$actionItemClear = document.getElementsByClassName('action-list__item-clear')[0].querySelector('a');
        this.$actionItemDestroy = document.getElementsByClassName('action-list__item-destroy')[0].querySelector('a');
    }

    bindEvents() {
        let that = this;

        document.addEventListener('click', function (event) {
            that.closeList(event.target);
        }, false);


        this.$mySelectButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (!that.listState) {
                that.animChanges().stateFirst();
            } else {
                that.animChanges().stateSecond();
            }
        }, false);

        //---------- Action List Events ------------------
        this.$actionItemOpen.addEventListener('click', function(event){
            event.preventDefault();
            if (!that.listState) {
                that.animChanges().stateFirst();
            } 
        }, false);

        this.$actionItemClose.addEventListener('click', function(event){
            event.preventDefault();
            if (that.listState) {
                that.animChanges().stateSecond();
            } 
        }, false);

        this.$actionItemSet.addEventListener('click', function(event){
            event.preventDefault();
            that.setItemByAction();
        }, false);

        this.$actionItemGet.addEventListener('click', function(event){
            event.preventDefault();
            that.getSelected();
        }, false);

        this.$actionItemClear.addEventListener('click', function(event){
            event.preventDefault();
            that.clearChoice();
        }, false);

        this.$actionItemDestroy.addEventListener('click', function(event){
            event.preventDefault();
            that.destroyList();
        }, false);

    }

    closeList(elem) {

        // console.log(that.listState);
        // log('Clicked outside list', 'bold');
        
        if ( this.listState 
            && elem.classList[0] !== 'section__button' 
            && elem.classList[0] !== 'section__technology-list' 
            && elem.classList[0] !== 'section__technology-item'
            && elem !== this.$actionItemOpen
            && elem !== this.$actionItemClose
            && elem !== this.$actionItemSet
            && elem !== this.$actionItemGet
            && elem !== this.$actionItemClear
            && elem !== this.$actionItemDestroy) {
            this.animChanges().stateSecond();
        }
    }

    animChanges() {

        return {
            stateFirst: () => {
                let that = this;
                this.changeElemClasses().selectStateIcon_State_1(this);
                this.changeElemClasses().myLabelClass_Add(this);
                this.changeElemClasses().myList_Opened(this);

                if (!this.localDataState) {    
                    this.animateDownloadStatus().start();
                    console.log('Started receiving data...');
                    new Promise( (resolve, reject) => {
                        let data = fetch(this.url).then( response => response.json())
                                        .then( (response) => { 
                                            that.animateDownloadStatus().stop(); 
                                            console.log('Receiving has done!');
                                            that.showList(response);
                                            that.localDataState = !that.localDataState;
                                        }); 
                        return data;
                    });
                
                } else { 
                    if (this.choiceState) {
                        this.changeElemClasses().myListItem_Selected(this);
                    }
                }
                this.changeFlags().listState(this);
                
            },

            stateSecond: () => {
                this.changeElemClasses().selectStateIcon_State_2(this);

                if (!this.choiceState) {
                    this.changeElemClasses().myLabelClass_Remove(this);
                }
                this.changeElemClasses().myList_Closed(this);
                this.changeFlags().listState(this);

            }
        }
    }

    changeElemClasses() {
        return {
            selectStateIcon_State_1(that) {
                that.$mySelectStateIcon.classList.toggle("list-button-state-1");
                that.$mySelectStateIcon.classList.toggle("list-button-state-2");
            },
            selectStateIcon_State_2(that) {
                that.$mySelectStateIcon.classList.toggle("list-button-state-2");
                that.$mySelectStateIcon.classList.toggle("list-button-state-1");
            },
            myLabelClass_Add(that) {
                that.$myLabel.classList.add("my-label_active");
            },
            myLabelClass_Remove(that) {
                that.$myLabel.classList.remove("my-label_active");
            },
            myList_Opened(that) {
                that.$techListElement.classList.remove('section__technology-list_unvisible');
            },
            myList_Closed(that) {
                that.$techListElement.classList.add('section__technology-list_unvisible');
            },
            myListItem_Selected(that) {
                that.$listItem[that.activeItem.num-1].classList.add('section__technology-item_active');
            },
            myActionButton_Blocked(that){
                // that.changeElemClasses().myActionButton_Blocked(this);
                that.$actionItemOpen.classList.add('noLink');
                that.$actionItemClose.classList.add('noLink');
                that.$actionItemSet.classList.add('noLink');
                that.$actionItemGet.classList.add('noLink');
                that.$actionItemClear.classList.add('noLink');
                that.$actionItemDestroy.classList.add('noLink');
            }
        }
    }

    changeFlags() {
        return {
            listState(that) {
                that.listState = !that.listState;
            },
            choiceState(that) {
                that.choiceState = !that.choiceState;
            },
            localData(that) {
                that.localDataState = !that.localDataState;
            }
        }
    }

    /*async getList(userURL) {

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

    }*/

    animateDownloadStatus() {
        return {
            start: () => {
                this.$downloadStatus.classList.add('download-status_active');
            },
            stop: () => {
                this.$downloadStatus.classList.remove('download-status_active');
            }
        }
    }

    showList(technology) {
        
        if (!this.localDataState) {

            for ( let tech in technology ) {
                this.createElement('li', this.$techListElement, 'section__technology-item', technology[tech].name)
            }
            this.list = technology;
        }
        if (this.choiceState){
    
            this.changeElemClasses().myListItem_Selected(this);
            // this.$selectInput.value = this.$listItem[this.setItem.num-1].textContent;
            this.$selectInput.value = this.activeItem.name;
        }
        this.listClickListening();

    }

    createElement(tagName, parrent, className, textValue) {
        let listItem = document.createElement(tagName);
        listItem.classList.add(className);
        listItem.innerHTML = textValue;
        parrent.appendChild(listItem);
    }

    listClickListening() {
        let that = this;
    
        for (let index = 0; index < this.$listItem.length; index++ ){
            this.$listItem[index].addEventListener('click', function(event) { 

                
                that.resetListClass(that.$listItem[index].textContent);
                that.$listItem[index].classList.add('section__technology-item_active');
                that.choiceState = true;
                that.activeItem.name = that.$listItem[index].textContent;
                that.activeItem = {
                    num: index + 1,
                    name: that.$listItem[index].textContent
                };
                that.$selectInput.value = that.activeItem.name;
                that.showResultUnderActionList(that.$listItem[index].textContent);
            })
        }

    }

    resetListClass(itemValue = 200) {
        for (let elem of this.$listItem){
            if (elem.textContent !== itemValue) {
                elem.classList.remove('section__technology-item_active');
            }
        }
    }

    setItemByAction(){
        let that = this;

        this.activeItem.num = this.setItem.num;

        if (this.localDataState) {
            getParticularItem(this.list);    
        } else {
            fetch(this.url)
                .then( response => response.json())
                .then( response => {
                    getParticularItem(response);
                });
        }
        

        function getParticularItem(technology) {
            for ( let tech in technology ) {
                if (technology[tech].id === that.activeItem.num) {
                    that.activeItem.name = technology[tech].name;
                    that.$selectInput.value = that.activeItem.name;
                    that.resetListClass(that.activeItem.name);
                    // that.changeElemClasses().myListItem_Selected(that);
                    that.showResultUnderActionList(technology[tech].name);
                    that.choiceState = true;
                    if (that.listState) {
                            that.changeElemClasses().myListItem_Selected(that);
                    }
                    // that.changeElemClasses().myListItem_Selected(that);
                    that.changeElemClasses().myLabelClass_Add(that);
                }
            }            
        }
    }

    getSelected() {
        let that = this;
        if (this.choiceState) {
            fetch(this.url)
                .then( response => response.json())
                .then( response => {
                    for ( let tech in response ) {
                        if (response[tech].name === that.$actionListResult.textContent) {
                            alert( `Object { id: ${response[tech].id}, name: ${response[tech].name} }`);
                        }
                    }
                });
        } else {
            alert( `No selected items!`);
        }
    }

    clearChoice() {

        this.$actionListResult.textContent = 'No selected item';
        this.$selectInput.value = '';
        if ( this.choiceState === true ) {
            this.resetListClass();
            this.$myLabel.classList.remove("my-label_active");
            this.activeItem = { num: null, name: '' }; 
        }
        this.choiceState = false; 
        this.changeElemClasses().myList_Closed(this);
        this.listState = false; 
               
    }

    destroyList() {
        this.changeElemClasses().myActionButton_Blocked(this);

        this.$sectionSelect.innerHTML = `
        <div class="alert">
            <strong style='display: block; font-size:20px'>Our selector has been deleted! :) </strong>
        </div>`;
        this.activeItem = { num: null, name: '' }; 
        this.showResultUnderActionList();
    }

    showResultUnderActionList(result) {
        if (result) {
            this.$actionListResult.textContent = result;
        } else {
            this.$actionListResult.textContent = 'No selected item';
        }
    }

}

const myProgressiveSelector = new ProgressiveSelect(progressiveSelectOptions);
myProgressiveSelector.init();













