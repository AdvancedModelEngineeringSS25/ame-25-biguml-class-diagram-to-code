/*********************************************************************************
 * Copyright (c) 2023 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 *********************************************************************************/

import { Action, RequestAction, type ResponseAction } from '@eclipse-glsp/protocol';

import { type JavaCodeGenerationOptions } from '../types/config.js';

// ========= This action will be handled by the GLSP Client =========

export interface RequestCodeGenerationAction extends RequestAction<CodeGenerationActionResponse> {
    kind: typeof RequestCodeGenerationAction.KIND;
    language: string | null;
    languageOptions: JavaCodeGenerationOptions | null;
}

export namespace RequestCodeGenerationAction {
    export const KIND = 'requestCodeGeneration';

    export function is(object: unknown): object is RequestCodeGenerationAction {
        return RequestAction.hasKind(object, KIND);
    }

    export function create(options: Omit<RequestCodeGenerationAction, 'kind' | 'requestId'>): RequestCodeGenerationAction {
        return {
            kind: KIND,
            requestId: '',
            ...options
        };
    }
}

export interface CodeGenerationActionResponse extends ResponseAction {
    kind: typeof CodeGenerationActionResponse.KIND;
    success: boolean;
}

export namespace CodeGenerationActionResponse {
    export const KIND = 'codeGenerationResponse';

    export function is(object: unknown): object is CodeGenerationActionResponse {
        return Action.hasKind(object, KIND);
    }

    export function create(
        options?: Omit<CodeGenerationActionResponse, 'kind' | 'responseId'> & { responseId?: string }
    ): CodeGenerationActionResponse {
        return {
            kind: KIND,
            responseId: '',
            success: false,
            ...options
        };
    }
}

export interface RequestSelectFolderAction extends RequestAction<SelectFolderActionResponse> {
    kind: typeof RequestSelectFolderAction.KIND;
}

export namespace RequestSelectFolderAction {
    export const KIND = 'requestSelectFolder';

    export function is(object: unknown): object is RequestSelectFolderAction {
        return RequestAction.hasKind(object, KIND);
    }

    export function create(options: Omit<RequestSelectFolderAction, 'kind' | 'requestId'>): RequestSelectFolderAction {
        return {
            kind: KIND,
            requestId: '',
            ...options
        };
    }
}

export interface SelectFolderActionResponse extends ResponseAction {
    kind: typeof SelectFolderActionResponse.KIND;
    folderPath: string | null;
}

export namespace SelectFolderActionResponse {
    export const KIND = 'selectFolderResponse';

    export function is(object: unknown): object is SelectFolderActionResponse {
        return Action.hasKind(object, KIND);
    }

    export function create(
        options?: Omit<SelectFolderActionResponse, 'kind' | 'responseId'> & { responseId?: string }
    ): SelectFolderActionResponse {
        return {
            kind: KIND,
            responseId: '',
            folderPath: null,
            ...options
        };
    }
}
