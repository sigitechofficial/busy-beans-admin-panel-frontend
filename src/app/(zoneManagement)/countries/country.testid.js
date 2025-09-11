// --------- (Countries) ----------
const COUNTRIES = {
  // page
  root: "countries-page-root",
  headerBar: "countries-page-header-bar",
  title: "countries-page-title",

  // filter section
  filterSection: "countries-page-filter-section",
  filterSelect: "countries-page-filter-select",
  filterClearBtn: "countries-page-filter-clear-btn",

  // country management actions
  addCountryBtn: "countries-page-add-country-btn",
  countryCard: (id) => `countries-page-country-card-${id}`,
  countryCardDeleteBtn: (id) => `countries-page-country-card-${id}-delete-btn`,
  countryCardViewBtn: (id) => `countries-page-country-card-${id}-view-btn`,
  
  // modal
  countryModal: "countries-page-modal",
  countryModalTitle: "countries-page-modal-title",
  countryModalBody: "countries-page-modal-body",
  countrySelectDropdown: "countries-page-select-country-dropdown",
  countryModalCancelBtn: "countries-page-modal-cancel-btn",
  countryModalSubmitBtn: "countries-page-modal-submit-btn",
};

// --------- (States) ----------
const STATES = {
  // page
  root: "states-page-root",
  headerBar: "states-page-header-bar",
  title: "states-page-title",

  // filter section
  filterSection: "states-page-filter-section",
  filterSelect: "states-page-filter-select",
  filterClearBtn: "states-page-filter-clear-btn",

  // state management actions
  addStateBtn: "states-page-add-state-btn",
  stateCard: (id) => `states-page-state-card-${id}`,
  stateCardDeleteBtn: (id) => `states-page-state-card-${id}-delete-btn`,
  stateCardViewBtn: (id) => `states-page-state-card-${id}-view-btn`,
  
  row: (id) => `state-row-${id}`,

  // modal
  stateModal: "states-page-modal",
  stateModalTitle: "states-page-modal-title",
  stateModalBody: "states-page-modal-body",
  stateSelectDropdown: "states-page-select-state-dropdown",
  stateModalCancelBtn: "states-page-modal-cancel-btn",
  stateModalSubmitBtn: "states-page-modal-submit-btn",
};

// --------- (Cities) ----------
const CITIES = {
  // page
  root: "cities-page-root",
  headerBar: "cities-page-header-bar",
  title: "cities-page-title",

  // filter section
  filterSection: "cities-page-filter-section",
  filterSelect: "cities-page-filter-select",
  filterClearBtn: "cities-page-filter-clear-btn",

  // city management actions
  addCityBtn: "cities-page-add-city-btn",
  addTerritoryBtn: "cities-page-add-territory-btn",
  cityCard: (id) => `cities-page-city-card-${id}`,
  cityCardDeleteBtn: (id) => `cities-page-city-card-${id}-delete-btn`,
  cityCardViewBtn: (id) => `cities-page-city-card-${id}-view-btn`,
  
  row: (id) => `city-row-${id}`,

  // modal
  cityModal: "cities-page-modal",
  cityModalTitle: "cities-page-modal-title",
  cityModalBody: "cities-page-modal-body",
  citySelectDropdown: "cities-page-select-city-dropdown",
  cityModalCancelBtn: "cities-page-modal-cancel-btn",
  cityModalSubmitBtn: "cities-page-modal-submit-btn",
};

// --------- (Territory Management) ----------
const TERRITORY = {
  // page
  root: "territory-page-root",
  headerBar: "territory-page-header-bar",
  title: "territory-page-title",

  // add/edit territory
  addTerritoryBtn: "territory-page-add-territory-btn",
  editTerritoryBtn: (id) => `territory-page-edit-${id}-btn`,
  deleteTerritoryBtn: (id) => `territory-page-delete-${id}-btn`,
  
  // territory details
  territoryCard: (id) => `territory-page-card-${id}`,
  territoryCardDeleteBtn: (id) => `territory-page-card-${id}-delete-btn`,
  territoryCardEditBtn: (id) => `territory-page-card-${id}-edit-btn`,
  
  // modal
  territoryModal: "territory-page-modal",
  territoryModalTitle: "territory-page-modal-title",
  territoryModalBody: "territory-page-modal-body",
  territoryNameInput: "territory-page-name-input",
  territoryCitySelect: "territory-page-city-select",
  territoryModalCancelBtn: "territory-page-modal-cancel-btn",
  territoryModalSubmitBtn: "territory-page-modal-submit-btn",

  // territory action buttons
  addCityToTerritoryBtn: "territory-page-add-city-to-territory-btn",
  deleteCityFromTerritoryBtn: "territory-page-delete-city-from-territory-btn",
};

export {COUNTRIES, STATES, CITIES, TERRITORY}