    // Here I'm controlling state -> converting sessionStorage to usable format
    function StateController () {

        this.saveState = (stateProps) => { //Object

            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            window.sessionStorage.setItem('gitsearch', 
                JSON.stringify({...currentState, ...stateProps}));

            console.log(JSON.parse(window.sessionStorage.getItem('gitsearch')));
        };

        this.loadState = (stateProps) => { //String

            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            return (stateProps && currentState) ? 
                JSON.parse(window.sessionStorage.getItem('gitsearch'))[stateProps] :
                currentState;
        };

        this.removeStateItem = (stateItems) => { //Array[String]
            
            let currentState = 
                JSON.parse(window.sessionStorage.getItem('gitsearch'));

            stateItems.forEach(itm => {
                currentState[itm] = initState[itm];
            });

            window.sessionStorage.setItem('gitsearch', 
              JSON.stringify({...currentState, ...currentState}));
        };

        this.checkStorage = () => {

            let currentState = JSON.parse(window.sessionStorage.getItem('gitsearch'));

            console.log(currentState);

            currentState ? 
            Actions.loadFromStore()
            : 
            window.sessionStorage.setItem('gitsearch', JSON.stringify(initState));
        }
    }