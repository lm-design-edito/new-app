import getPageId from './get-lm-page-id'
import getPageData from './get-lm-page-data'
import getPageOptions from './get-lm-page-options'
import getPageHeader from './get-lm-page-header'

// [WIP] Make sure DOM is all loaded before init ? Not necessary ?
init()

async function init () {
  // [WIP] Get page target version and choose if init here or dynamic import a previous initor?

  // [WIP] load generic styles ? Or already in DOM ? Or load if not in DOM ?  

  const options = getPageOptions()
  // [WIP] Do stuff with options, like removing header, etc
  
  const id = getPageId()
  const data = await getPageData()
  // [WIP] filter data on page ID
  
  // [WIP] Create a new Map<Selector, { appType: string, appProps: any }>()
  // Loop through all selectors from data, and populate map

  // [WIP] Create a new Map<Element, { appType: string, appProps: any }>()
  // Select elements that match selector from the first map, read their inline
  // type and props if any, merge them to the type and props from data and add to map
  
  // Loop through all elements containing data.lm-app-type or data.lm-app-config
  // if element not in map yet, parse app type and props push in map

  // Dynamic import needed apps and render each as soon as the import resolves
}

// [WIP] export something in order to call "render/update" on a dynamically added element
