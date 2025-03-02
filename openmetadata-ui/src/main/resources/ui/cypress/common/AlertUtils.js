/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { isEmpty, startCase } from 'lodash';
import { DELETE_TERM } from '../constants/constants';
import {
  interceptURL,
  toastNotification,
  verifyResponseStatusCode,
} from './common';

// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

export const deleteAlertSteps = (name) => {
  cy.get('table').should('contain', name).click();
  cy.get(`[data-testid="alert-delete-${name}"]`).should('be.visible').click();
  cy.get('.ant-modal-header')
    .should('be.visible')
    .should('contain', `Delete subscription "${name}"`);
  cy.get('[data-testid="confirmation-text-input"]')
    .should('be.visible')
    .type(DELETE_TERM);
  interceptURL('DELETE', '/api/v1/events/subscriptions/*', 'deleteAlert');
  cy.get('[data-testid="confirm-button"]').should('be.visible').click();
  verifyResponseStatusCode('@deleteAlert', 200);

  toastNotification(`"${name}" deleted successfully!`);
};

export const addOwnerFilter = (
  filterNumber,
  ownerName,
  exclude = false,
  selectId = 'Owner'
) => {
  // Select owner filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get(`[data-testid="${selectId}-filter-option"]`)
    .filter(':visible')
    .click();

  // Search and select owner
  cy.get('[data-testid="owner-name-select"]').click().type(ownerName);
  verifyResponseStatusCode('@getSearchResult', 200);
  cy.get(`[title="${ownerName}"]`).filter(':visible').scrollIntoView().click();
  cy.get('[data-testid="owner-name-select"]').should('contain', ownerName);

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addEntityFQNFilter = (
  filterNumber,
  entityFQN,
  exclude = false,
  selectId = 'Entity FQN'
) => {
  // Select entity FQN filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get(`[data-testid="${selectId}-filter-option"]`)
    .filter(':visible')
    .click();

  // Search and select entity
  cy.get('[data-testid="fqn-list-select"]').click().type(entityFQN);
  verifyResponseStatusCode('@getSearchResult', 200);
  cy.get(`[title="${entityFQN}"]`).filter(':visible').scrollIntoView().click();
  cy.get('[data-testid="fqn-list-select"]').should('contain', entityFQN);

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addEventTypeFilter = (
  filterNumber,
  eventType,
  exclude = false
) => {
  // Select event type filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get('[data-testid="Event Type-filter-option"]').filter(':visible').click();

  // Search and select event type
  cy.get('[data-testid="event-type-select"]').click().type(eventType);
  verifyResponseStatusCode('@getSearchResult', 200);
  cy.get(`[title="${eventType}"]`).filter(':visible').scrollIntoView().click();
  cy.get('[data-testid="event-type-select"]').should('contain', eventType);

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addUpdaterNameFilter = (
  filterNumber,
  updaterName,
  exclude = false
) => {
  // Select updater name filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get('[data-testid="Updater Name-filter-option"]')
    .filter(':visible')
    .click();

  // Search and select user
  cy.get('[data-testid="user-name-select"]').click().type(updaterName);
  verifyResponseStatusCode('@getSearchResult', 200);
  cy.get(`[title="${updaterName}"]`)
    .filter(':visible')
    .scrollIntoView()
    .click();
  cy.get('[data-testid="user-name-select"]').should('contain', updaterName);

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addDomainFilter = (filterNumber, domainName, exclude = false) => {
  // Select domain filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get('[data-testid="Domain-filter-option"]').filter(':visible').click();

  // Search and select domain
  cy.get('[data-testid="domain-select"]').click().type(domainName);
  verifyResponseStatusCode('@getSearchResult', 200);
  cy.get(`[title="${domainName}"]`).filter(':visible').scrollIntoView().click();
  cy.get('[data-testid="domain-select"]').should('contain', domainName);

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addGMEFilter = (filterNumber, exclude = false) => {
  // Select general metadata events filter
  cy.get(`[data-testid="filter-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get('[data-testid="General Metadata Events-filter-option"]')
    .filter(':visible')
    .click();

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addInternalDestination = (
  destinationNumber,
  category,
  type,
  typeId,
  searchText
) => {
  // Select destination category
  cy.get(`[data-testid="destination-category-select-${destinationNumber}"]`)
    .scrollIntoView()
    .click();
  cy.get(`[data-testid="${category}-internal-option"]`)
    .filter(':visible')
    .scrollIntoView()
    .click();

  // Select the receivers
  if (typeId) {
    cy.get(`[data-testid="${typeId}"]`).click().type(searchText);
    verifyResponseStatusCode('@getSearchResult', 200);
    cy.get(`[title="${searchText}"]`)
      .filter(':visible')
      .scrollIntoView()
      .click();
    cy.clickOutside();
  }

  // Select destination type
  cy.get(`[data-testid="destination-type-select-${destinationNumber}"]`)
    .scrollIntoView()
    .click();
  cy.get(`[data-testid="${type}-external-option"]`).filter(':visible').click();

  // Check the added destination type
  cy.get(
    `[data-testid="destination-type-select-${destinationNumber}"] [data-testid="${type}-external-option"]`
  );
};

const checkActionOrFilterDetails = (filters) => {
  if (!isEmpty(filters)) {
    filters.forEach((filter) => {
      // Check filter
      // Check filter effect
      cy.get('[data-testid="effect-value"]').should(
        'contain',
        startCase(filter.effect)
      );

      // Check filter name
      cy.get('[data-testid="filter-name"]').should(
        'contain',
        startCase(filter.name)
      );

      if (!isEmpty(filter.arguments)) {
        filter.arguments.forEach((argument) => {
          // Check filter arguments
          // TODO: uncomment this when backend API gives the name of the argument
          //   cy.get(`[data-testid="argument-container-${argument.name}"]`).should(
          //     'exist'
          //   );
          argument.input.forEach((val) => {
            cy.get('[data-testid="argument-value"]').should('contain', val);
          });
        });
      }
    });
  }
};

export const verifyAlertDetails = (
  alertDetails,
  isObservabilityAlert = false
) => {
  const { name, description, filteringRules, input, destinations } =
    alertDetails;

  const triggerName = filteringRules.resources[0];
  const filters = input.filters;

  // Check created alert details
  cy.get('[data-testid="alert-details-container"]').should('exist');

  // Check alert name
  cy.get('[data-testid="alert-name"]').should('contain', name);

  if (description) {
    // Check alert name
    cy.get('[data-testid="alert-description"]').should('contain', description);
  }

  // Check trigger name
  cy.get('[data-testid="resource-name"]').should(
    'contain',
    startCase(triggerName)
  );

  // Check filter details
  checkActionOrFilterDetails(filters);

  if (isObservabilityAlert) {
    const actions = input.actions;

    // Check action details
    checkActionOrFilterDetails(actions);
  }

  if (!isEmpty(destinations)) {
    destinations.forEach((destination) => {
      // Check Destination category
      cy.get(
        `[data-testid="destination-${destination.category}"] [data-testid="category-value"]`
      ).should('contain', destination.category);

      // Check Destination type
      cy.get(
        `[data-testid="destination-${destination.category}"] [data-testid="destination-type"]`
      ).should('contain', startCase(destination.type));

      if (!isEmpty(destination.config?.receivers)) {
        // Check Destination receivers
        destination.config.receivers.forEach((receiver) => {
          cy.get(`[data-testid="receiver-${receiver}"]`).should('exist');
        });
      }
    });
  }
};

export const addGetSchemaChangesAction = (filterNumber, exclude = false) => {
  // Select owner filter
  cy.get(`[data-testid="action-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get(`[data-testid="Get Schema Changes-filter-option"]`)
    .filter(':visible')
    .click();

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};

export const addPipelineStatusUpdatesAction = (
  filterNumber,
  statusName,
  exclude = false
) => {
  // Select domain filter
  cy.get(`[data-testid="action-select-${filterNumber}"]`).click({
    waitForAnimations: true,
  });
  cy.get('[data-testid="Get Pipeline Status Updates-filter-option"]')
    .filter(':visible')
    .click();

  // Search and select domain
  cy.get('[data-testid="pipeline-status-select"]').click().type(statusName);
  cy.get(`[title="${statusName}"]`).filter(':visible').scrollIntoView().click();
  cy.get('[data-testid="pipeline-status-select"]').should(
    'contain',
    statusName
  );
  cy.clickOutside();

  if (exclude) {
    // Change filter effect
    cy.get(`[data-testid="filter-switch-${filterNumber}"]`)
      .scrollIntoView()
      .click();
  }
};
