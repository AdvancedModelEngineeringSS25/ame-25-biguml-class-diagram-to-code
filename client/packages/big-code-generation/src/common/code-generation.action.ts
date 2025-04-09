/*********************************************************************************
 * Copyright (c) 2023 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 *********************************************************************************/

import { Action, RequestAction, type ResponseAction } from '@eclipse-glsp/protocol';

// ========= This action will be handled by the GLSP Client =========

export interface RequestCodeGenerationAction extends RequestAction<CodeGenerationActionResponse> {
    kind: typeof RequestCodeGenerationAction.KIND;
    increase: number;
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
    count: number;
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
            count: 0,
            ...options
        };
    }
}
