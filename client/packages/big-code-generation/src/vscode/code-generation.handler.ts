/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/

import {
    EXPERIMENTAL_TYPES,
    TYPES,
    type ActionDispatcher,
    type ActionListener,
    type Disposable,
    type ExperimentalGLSPServerModelState
} from '@borkdominik-biguml/big-vscode-integration/vscode';
import { DisposableCollection } from '@eclipse-glsp/protocol';
import { inject, injectable, postConstruct } from 'inversify';
import { CodeGenerationActionResponse, RequestCodeGenerationAction } from '../common/code-generation.action.js';

import {
    CSharpTargetLanguage,
    FetchingJSONSchemaStore,
    getTargetLanguage,
    InputData,
    JavaTargetLanguage,
    JSONSchemaInput,
    PythonTargetLanguage,
    quicktype,
    TypeScriptTargetLanguage,
    type TargetLanguage
} from 'quicktype-core';

// Handle the action within the server and not the glsp client / server
@injectable()
export class CodeGenerationActionHandler implements Disposable {
    @inject(TYPES.ActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;
    @inject(TYPES.ActionListener)
    protected readonly actionListener: ActionListener;
    @inject(EXPERIMENTAL_TYPES.GLSPServerModelState)
    protected readonly modelState: ExperimentalGLSPServerModelState;

    private readonly toDispose = new DisposableCollection();
    private count = 0;

    @postConstruct()
    protected init(): void {
        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestCodeGenerationAction>(RequestCodeGenerationAction.KIND, async message => {
                this.count += message.action.increase;
                const model = this.modelState.getModelState();
                if (model) {
                    const sourceModel = model.getSourceModel();
                    console.log('Model available', sourceModel);

                    const personSchema = {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        properties: {
                            author: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    preferredName: { type: 'string' },
                                    age: { type: 'number' },
                                    gender: { enum: ['male', 'female', 'other'] }
                                },
                                required: ['name', 'preferredName', 'age', 'gender']
                            },
                            title: { type: 'string' },
                            publisher: { type: 'string' }
                        },
                        required: ['author', 'title', 'publisher']
                    };

                    const { lines: javaPerson } = await this.quickTypeJSONSchema('java', 'Person', JSON.stringify(personSchema));
                    console.log(javaPerson);
                } else {
                    console.log('No model available');
                }

                return CodeGenerationActionResponse.create({
                    count: this.count
                });
            })
        );
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    private getTargetLanguageInstance(lang: string): TargetLanguage {
        switch (lang.toLowerCase()) {
            case 'java':
                return new JavaTargetLanguage();
            case 'typescript':
                return new TypeScriptTargetLanguage();
            case 'csharp':
                return new CSharpTargetLanguage();
            case 'python':
                return new PythonTargetLanguage();
            default:
                throw new Error(`Unsupported language: ${lang}`);
        }
    }

    private async quickTypeJSONSchema(targetLanguage: string, typeName: string, jsonSchemaString: string) {
        const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());

        await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

        const inputData = new InputData();
        inputData.addInput(schemaInput);

        const lang = getTargetLanguage(this.getTargetLanguageInstance(targetLanguage));
        if (lang === undefined) {
            throw new Error(`Unsupported language: ${targetLanguage}`);
        }

        return await quicktype({
            inputData,
            lang: lang,
            rendererOptions: {
                'just-types': true
            }
        });
    }
}
