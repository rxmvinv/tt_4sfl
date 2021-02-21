// Here I'm building and attaching to DOM components dynamically

function DynamicComponent () {

    this.mainHeader = () => 
        loadElement({
            title: 'mainHeader', 
            elements: ['users', 'repos']
        });
        
    this.searchField = () => 
        loadElement({
            title: 'searchField'
        });
        
    this.pagination = () => 
        loadElement({
            title: 'pagination', 
            elements: ['prev', 'next']
        });
        
    this.backButton = () => 
        loadElement({
            title: 'backButton', 
            elements: [`back to ${'users'}`] 
        });
        
    this.userItems = (userData, upd) => 
        loadElement({
            title: 'userItems', 
            elements: userData, //[{avatar, username, about}]
            update: upd
        });
        
    this.userInfo = (info) => 
        loadElement({
            title: 'userInfo', 
            elements: [info] 
        });
        
    this.userAbout = (about) => 
        loadElement({
            title: 'userAbout', 
            elements: [`${about}`] 
        });
        
    this.repositoryEntries = (reposData, upd) => 
        loadElement({
            title: 'repositoryEntries', 
            elements: reposData,
            update: upd
        });

    const loadElement = function ({title, elements, update}) {

        switch (title) {

            case 'backButton':

                let backButton = document.createElement('div'),
                    button = document.createElement('button'),
                    arrow = document.createElement('span');
    
                button.appendChild(arrow);

                backButton.appendChild(button)
                    .appendChild(document.createTextNode(elements[0]));

                backButton.setAttribute('class', 'back-button');

                backButton.addEventListener('click', function () {

                    Router.goBack();

                });

                return backButton;

            case 'mainHeader':

                let header = document.createElement('header'),
                    nav = document.createElement('nav');
    
                elements.forEach(element => {

                    let button = document.createElement('button');

                    button.setAttribute('class', 'nav-buttons');

                    button.setAttribute('value', element);

                    button.addEventListener('click', function (e) {

                        Router.navigate(e.target.value);
                        // button.className = button.className ? '' : 'active'; //e.target
                    });
                    nav.appendChild(button)
                        .appendChild(document.createTextNode(element));

                });
    
                header.appendChild(nav);

                return header;

            case 'searchField':

                let field = document.createElement('input'),
                    curRoute = State.loadState(['currentRoute']);

                field.setAttribute('class', 'search-field');

                field.setAttribute('placeholder', `Search git ${curRoute}`);

                field.addEventListener('input', function (e) {

                    Actions.searchCriteria(e.target.value);

                });

                field.addEventListener('keypress', function(ev) {

                    if (ev.keyCode === 13) {

                        ev.preventDefault();

                        Actions.loadData();

                    }

                });

                return field;

            case 'pagination':

                let pagination = document.createElement('div');

                pagination.setAttribute('class', 'pagination');

                elements.forEach(element => {

                    let button = document.createElement('button'),
                        arrow = document.createElement('span');

                    button.setAttribute('value', element);

                    button.addEventListener('click', function (e) {
                        
                        let forward = (e.target.innerText === 'next') ||
                            (e.target.value === 'next');

                        Actions.listingItems(forward);

                    });

                    button.appendChild(arrow);

                    pagination.appendChild(button)
                        .appendChild(document.createTextNode(element));
                });
    
                return pagination;

            case 'userItems':

                let usersList = update ? 
                    (
                        document.getElementsByClassName('user-items')[0] ||
                        document.createElement('ul')
                    ) : 
                    document.createElement('ul');

                !update && usersList.setAttribute('class', 'user-items');

                elements && elements.forEach(element => {

                    let listItem = document.createElement('li'),
                        itemButton = document.createElement('button'),
                        avatar = document.createElement('img');

                    itemButton.setAttribute('value', element.login);

                    avatar.setAttribute('src', element.avatar_url);

                    itemButton.appendChild(avatar);

                    itemButton.appendChild(document.createTextNode(element.login));

                    itemButton.addEventListener('click', function (e) {

                        let userName = element.login || 
                            e.target.value || e.target.innerText;

                        Actions.selectUser(userName);

                        Router.navigate('user', userName);

                        Actions.loadData();

                    });

                    listItem.appendChild(itemButton);

                    usersList.appendChild(listItem);

                });
    
                return usersList;

            case 'userInfo':

                let listItem = document.createElement('div'),
                        avatar = document.createElement('img');

                avatar.setAttribute('src', elements[0].avatar_url);

                listItem.appendChild(avatar);

                listItem.appendChild(document.createTextNode(elements[0].login));
    
                return listItem;

            case 'userAbout':

                let about = document.createElement('p');

                about.setAttribute('class', 'user-about');

                about.appendChild(document.createTextNode(elements[0]));

                return about;

            case 'repositoryEntries':

                let reposList = update ? 
                    document.getElementsByClassName('repos-list')[0] : 
                    document.createElement('ul');

                !update && reposList.setAttribute('class', 'repos-list');

                elements && elements.forEach(element => {

                    let listItem = document.createElement('li');

                    listItem.appendChild(document.createTextNode(element.description));

                    reposList.appendChild(listItem);

                });
    
                return reposList;
        }
    };
};