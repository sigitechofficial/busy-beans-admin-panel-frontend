// --------- (Countries) ----------
const COUNTRIES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterClearBtn: "filter-clear-btn",

  // country management actions
  addCountryBtn: "add-country-btn",
  countryCard: (id) => `country-card-${id}`,
  countryCardDeleteBtn: (id) => `country-card-${id}-delete-btn`,
  countryCardViewBtn: (id) => `country-card-${id}-view-btn`,
  
  // modal
  countryModal: "modal",
  countryModalTitle: "modal-title",
  countryModalBody: "modal-body",
  countrySelectDropdown: "select-country-dropdown",
  countryModalCancelBtn: "modal-cancel-btn",
  countryModalSubmitBtn: "modal-submit-btn",
};

// --------- (States) ----------
const STATES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterClearBtn: "filter-clear-btn",

  // state management actions
  addStateBtn: "add-state-btn",
  stateCard: (id) => `state-card-${id}`,
  stateCardDeleteBtn: (id) => `state-card-${id}-delete-btn`,
  stateCardViewBtn: (id) => `state-card-${id}-view-btn`,
  
  row: (id) => `row-${id}`,

  // modal
  stateModal: "modal",
  stateModalTitle: "modal-title",
  stateModalBody: "modal-body",
  stateSelectDropdown: "select-state-dropdown",
  stateModalCancelBtn: "modal-cancel-btn",
  stateModalSubmitBtn: "modal-submit-btn",
};

// --------- (Cities) ----------
const CITIES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterClearBtn: "filter-clear-btn",

  // city management actions
  addCityBtn: "add-city-btn",
  addTerritoryBtn: "add-territory-btn",
  cityCard: (id) => `city-card-${id}`,
  cityCardDeleteBtn: (id) => `city-card-${id}-delete-btn`,
  cityCardViewBtn: (id) => `city-card-${id}-view-btn`,
  
  row: (id) => `row-${id}`,

  // modal
  cityModal: "modal",
  cityModalTitle: "modal-title",
  cityModalBody: "modal-body",
  citySelectDropdown: "select-city-dropdown",
  cityModalCancelBtn: "modal-cancel-btn",
  cityModalSubmitBtn: "modal-submit-btn",
};

// --------- (Territory Management) ----------
const TERRITORY = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // add/edit territory
  addTerritoryBtn: "add-territory-btn",
  editTerritoryBtn: (id) => `edit-${id}-btn`,
  deleteTerritoryBtn: (id) => `delete-${id}-btn`,
  
  // territory details
  territoryCard: (id) => `card-${id}`,
  territoryCardDeleteBtn: (id) => `card-${id}-delete-btn`,
  territoryCardEditBtn: (id) => `card-${id}-edit-btn`,
  
  // modal
  territoryModal: "modal",
  territoryModalTitle: "modal-title",
  territoryModalBody: "modal-body",
  territoryNameInput: "name-input",
  territoryCitySelect: "city-select",
  territoryModalCancelBtn: "modal-cancel-btn",
  territoryModalSubmitBtn: "modal-submit-btn",

  // territory action buttons
  addCityToTerritoryBtn: "add-city-to-territory-btn",
  deleteCityFromTerritoryBtn: "delete-city-from-territory-btn",
};

export { COUNTRIES, STATES, CITIES, TERRITORY };
