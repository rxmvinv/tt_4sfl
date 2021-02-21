    // here I'm acting: creating requests actions, ui actions
    function ActionsController () {

        this.loadFromStore = () => {

            const evt = new Event(constants.PAGE_LOAD, 
                {"bubbles":true, "cancelable":false});

            document.dispatchEvent(evt);
        };

        this.routeUpdate = (route) => {
          
            const evt = new CustomEvent(constants.ROUTE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {route}});

            document.dispatchEvent(evt);
        };

        this.searchCriteria = (val) => {

            let search = val;

            const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {search}});

            document.dispatchEvent(evt);
        };

        this.listingItems = (forward) => {

          let {
                  currentRoute,
                  paginationCurrent: dataCurrent, 
                  paginationDivider: dataDivider, 
                  [currentRoute === 'repos' ? 'repositories' : currentRoute]: 
                  dataToSort
              } = State.loadState(),
              curUser;
          if (!dataToSort) {
            curUser = State.loadState(['selectedUser']);
            dataToSort = curUser.repositories;
          }

          console.log(
              currentRoute,
              dataToSort,
              dataCurrent,
              dataDivider);


          if (forward) {

            let localData = dataToSort,
              dataCounter = localData.length,
              dataNext = dataCurrent;
      
            if (dataCurrent !== dataCounter) {

              if (dataCurrent < dataCounter) dataNext += dataDivider;
      
              if (dataCurrent < dataCounter) localData = 
                  localData.slice(dataCurrent, dataNext);
        
              dataCurrent = dataNext;
              
              let dataToSave = curUser ? {
                paginationCurrent: dataCurrent,
                selectedUser: {
                  ...curUser,
                  activeRepos: localData
                }
              } : {
                paginationCurrent: dataCurrent,
                [currentRoute === 'repos' ? 'activeRepos' : 'activeUsers']: localData
              };
                  
              const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: dataToSave});
    
              document.dispatchEvent(evt);

              UserInterface.reportRoute(currentRoute);

            }

          } else {
            
            let localData = dataToSort,
              dataCurrentLocal = dataCurrent - dataDivider;
              dataNext = dataCurrentLocal;
      
            if (dataCurrent > dataDivider) {

              if (dataCurrentLocal > 0) dataNext -= dataDivider;
      
              if (dataCurrentLocal > 0) localData = 
                  localData.slice(dataNext, dataCurrentLocal);
      
              dataCurrent = dataNext += dataDivider;

              let dataToSave = curUser ? {
                paginationCurrent: dataCurrent,
                selectedUser: {
                  ...curUser,
                  activeRepos: localData
                }
              } : {
                paginationCurrent: dataCurrent,
                [currentRoute === 'repos' ? 'activeRepos' : 'activeUsers']: localData
              };
                  
              const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: dataToSave});
    
              document.dispatchEvent(evt);
              
              UserInterface.reportRoute(currentRoute);

            }

          }
        };

        this.selectUser = (userName) => {

            let users = State.loadState(['users']),
                selectedUser = users.find(us => 
                    us.login === userName);

            const evt = new CustomEvent(constants.STATE_CHANGE, 
                {bubbles: true, cancelable: false, detail: {selectedUser}});

            document.dispatchEvent(evt);
        };

        this.loadData = async () => {

            let { currentRoute, search, selectedUser, paginationDivider
              } = State.loadState(),

              requestUrl = (currentRoute === 'repos') ? 
                `${dataUrl}/${'repositories'}` : 
              (selectedUser && selectedUser.login) ? 
                `${dataUrl}/${currentRoute}/repos` :
                `${dataUrl}/${currentRoute}/${search}`;

            myHeaders = new Headers();
            
            myHeaders.append('Content-Type', 'application/json');

            let getRequest = new Request(requestUrl, 
                { method: 'GET',
                  headers: myHeaders,
                  mode: 'cors',
                  cache: 'default' 
                }),
                futureData = await fetch(getRequest);

            futureData.json()
              .then(data => {
                
                let dataToSave = (selectedUser && selectedUser.login) ? {
                    selectedUser: {
                      ...selectedUser,
                      repositories: data,
                      activeRepos: data.slice(0, 20),
                      paginationCurrent: paginationDivider
                    }
                  } :
                    (currentRoute === 'repos') ?
                      {
                        repositories: [...data],
                        activeRepos: [...data].slice(0, 20),
                        paginationCurrent: paginationDivider
                      } : 
                      {
                        [currentRoute]: [data],
                        activeUsers: [data].slice(0, 20),
                        paginationCurrent: paginationDivider
                      };

                const evt = new CustomEvent(constants.STATE_CHANGE, 
                    {bubbles: true, cancelable: false, detail: dataToSave});

                document.dispatchEvent(evt);
             
                UserInterface.refreshData(currentRoute, selectedUser && selectedUser.login);
              })
              .catch(err => console.log('err', err));
        };
    }