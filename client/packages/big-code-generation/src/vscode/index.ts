/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/

export * from './code-generation.module.js';
export * from './code-generation.provider.js';

import Handlebars from 'handlebars';

Handlebars.registerHelper('isdefined', function (value) {
    return value !== undefined;
});

Handlebars.registerHelper('isClass', function (value) {
    if (!value || typeof value.eClass !== 'string') {
        throw new TypeError('Expected `this.eClass` to be a string');
    }
    return value.eClass === 'http://www.eclipse.org/uml2/5.0.0/UML#//Class';
});
