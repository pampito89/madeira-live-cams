export type LocationListView = {
  activeFilter: string;
  scrollY: number;
};

let savedLocationListView: LocationListView | null = null;
let returnedToLocationListWithBack = false;
let popStateListenerAdded = false;

function addPopStateListener() {
  if (typeof window === 'undefined' || popStateListenerAdded) return;

  window.addEventListener('popstate', () => {
    if (window.location.pathname.endsWith('/cameras')) {
      returnedToLocationListWithBack = true;
    }
  });

  popStateListenerAdded = true;
}

export function saveLocationListView(activeFilter: string, scrollY: number) {
  addPopStateListener();
  savedLocationListView = { activeFilter, scrollY };
}

export function consumeLocationListViewForBackNavigation() {
  addPopStateListener();

  if (!returnedToLocationListWithBack) {
    savedLocationListView = null;
    return null;
  }

  returnedToLocationListWithBack = false;
  return savedLocationListView;
}
